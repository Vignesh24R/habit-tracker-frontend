import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private auth: Auth,
    private router: Router,
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.isLoading = true;

    // Reads the browser's own timezone automatically, so the user never has
    // to manually pick one — matches the Timezone field your backend expects.
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    this.auth.register({ email: this.email, password: this.password, timezone }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/habits']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message ?? 'Registration failed. Please try again.';
      },
    });
  }
}
