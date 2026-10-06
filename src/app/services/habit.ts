import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Habit {
  id: number;
  name: string;
  description?: string;
  scheduleType: number; // 0=Daily, 1=SpecificWeekdays, 2=TimesPerWeek, 3=CustomInterval
  weekdaysMask?: number;
  timesPerWeekTarget?: number;
  intervalDays?: number;
  isArchived: boolean;
  createdAt: string;
  reminderEnabled: boolean;
  reminderTime?: string;
}

export interface CreateHabitRequest {
  name: string;
  description?: string;
  scheduleType: number;
  weekdaysMask?: number;
  timesPerWeekTarget?: number;
  intervalDays?: number;
}

export interface UpdateReminderRequest {
  reminderEnabled: boolean;
  reminderTime?: string | null; // "HH:mm:ss" format, matches backend TimeOnly
}

export interface StreakResponse {
  currentStreak: number;
  longestStreak: number;
}

export interface HabitLog {
  id: number;
  date: string;
  completedAt: string;
}

@Injectable({ providedIn: 'root' })
export class HabitService {
  private readonly baseUrl = `${environment.apiUrl}/habits`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Habit[]> {
    return this.http.get<Habit[]>(this.baseUrl);
  }

  create(request: CreateHabitRequest): Observable<Habit> {
    return this.http.post<Habit>(this.baseUrl, request);
  }

  archive(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/archive`, {});
  }

  updateReminder(id: number, request: UpdateReminderRequest): Observable<Habit> {
    return this.http.put<Habit>(`${this.baseUrl}/${id}/reminder`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  logCompletion(habitId: number, date?: string): Observable<HabitLog> {
    return this.http.post<HabitLog>(`${this.baseUrl}/${habitId}/logs`, { date: date ?? null });
  }

  undoCompletion(habitId: number, logId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${habitId}/logs/${logId}`);
  }

  getStreak(habitId: number): Observable<StreakResponse> {
    return this.http.get<StreakResponse>(`${this.baseUrl}/${habitId}/streak`);
  }

  getLogs(habitId: number): Observable<HabitLog[]> {
    return this.http.get<HabitLog[]>(`${this.baseUrl}/${habitId}/logs`);
  }
}
