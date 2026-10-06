import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HabitService, Habit, StreakResponse } from '../../services/habit';
import { Auth } from '../../services/auth';

interface HabitWithStreak extends Habit {
  streak?: StreakResponse;
}

@Component({
  selector: 'app-habit-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './habit-list.html',
  styleUrl: './habit-list.css',
})
export class HabitList implements OnInit {
  // Signals, not plain properties. A signal explicitly tells Angular "this
  // value changed, please re-render anything that reads it" — this works
  // correctly whether or not Zone.js change detection is active, unlike a
  // plain `this.isLoading = false` assignment, which Zone.js used to pick
  // up automatically but newer zoneless setups do not.
  habits = signal<HabitWithStreak[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  newHabitName = signal('');
  showCreateForm = signal(false);

  // Tracks which habit's reminder editor is currently open (null = none open) —
  // only one at a time, keyed by habit id, so we don't need a boolean flag
  // stored on every single habit object.
  editingReminderHabitId = signal<number | null>(null);
  reminderTimeInput = signal('');

  constructor(
    private habitService: HabitService,
    private auth: Auth,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadHabits();
  }

  loadHabits(): void {
    this.isLoading.set(true);
    this.habitService.getAll().subscribe({
      next: (habits) => {
        this.habits.set(habits);
        this.isLoading.set(false);
        habits.forEach((h) => this.loadStreak(h.id));
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Could not load habits.');
      },
    });
  }

  loadStreak(habitId: number): void {
    this.habitService.getStreak(habitId).subscribe({
      next: (streak) => {
        // Signals holding arrays/objects need a fresh reference to notify
        // subscribers — mutating an item in place won't trigger updates,
        // so we map to a new array instead of pushing into the old one.
        this.habits.update((current) =>
          current.map((h) => (h.id === habitId ? { ...h, streak } : h)),
        );
      },
    });
  }

  markComplete(habit: HabitWithStreak): void {
    this.habitService.logCompletion(habit.id).subscribe({
      next: () => this.loadStreak(habit.id),
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Could not log completion.');
      },
    });
  }

  createHabit(): void {
    const name = this.newHabitName().trim();
    if (!name) return;

    this.habitService.create({ name, scheduleType: 0 }).subscribe({
      next: () => {
        this.newHabitName.set('');
        this.showCreateForm.set(false);
        this.loadHabits();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Could not create habit.');
      },
    });
  }

  archiveHabit(habit: HabitWithStreak): void {
    this.habitService.archive(habit.id).subscribe({
      next: () => this.loadHabits(),
    });
  }

  openReminderEditor(habit: HabitWithStreak): void {
    this.editingReminderHabitId.set(habit.id);
    // Pre-fill with the habit's existing reminder time if it has one,
    // trimmed to "HH:mm" since that's what <input type="time"> expects —
    // the backend's TimeOnly serializes as "HH:mm:ss".
    this.reminderTimeInput.set(habit.reminderTime ? habit.reminderTime.substring(0, 5) : '');
  }

  closeReminderEditor(): void {
    this.editingReminderHabitId.set(null);
    this.reminderTimeInput.set('');
  }

  saveReminder(habit: HabitWithStreak): void {
    const time = this.reminderTimeInput();
    if (!time) {
      this.errorMessage.set('Please choose a time.');
      return;
    }

    // <input type="time"> gives "HH:mm" — the backend TimeOnly needs "HH:mm:ss"
    const reminderTime = `${time}:00`;

    this.habitService.updateReminder(habit.id, { reminderEnabled: true, reminderTime }).subscribe({
      next: (updated) => {
        this.habits.update((current) =>
          current.map((h) => (h.id === habit.id ? { ...h, ...updated } : h)),
        );
        this.closeReminderEditor();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Could not update reminder.');
      },
    });
  }

  disableReminder(habit: HabitWithStreak): void {
    this.habitService.updateReminder(habit.id, { reminderEnabled: false }).subscribe({
      next: (updated) => {
        this.habits.update((current) =>
          current.map((h) => (h.id === habit.id ? { ...h, ...updated } : h)),
        );
        this.closeReminderEditor();
      },
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm.update((v) => !v);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
