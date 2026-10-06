import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
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

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/habits']);
      },
      error: (err) => {
        this.isLoading = false;
        // err.error is the JSON body your AuthController returns,
        // e.g. { message: "Invalid email or password." }
        this.errorMessage = err.error?.message ?? 'Login failed. Please try again.';
      },
    });
  }
}
