import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// ↑ ReactiveFormsModule: Angular's way of handling forms in code
//   rather than in the template. More powerful than template-driven
//   forms — easier to validate, test, and control programmatically.
//   FormBuilder: helper that creates form controls cleanly
//   Validators: built-in validation rules (required, email, minLength etc.)

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      // ↑ ['', [...]] means: default value '', with these validators
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Handy getter so template can access controls cleanly
  // e.g. this.email instead of this.loginForm.get('email')
  get email() {
    return this.loginForm.get('email');
  }
  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    // ↑ Double safety check — don't submit if validation fails

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (user) => {
        // Redirect based on role after login
        if (user.role === 'HOST') {
          this.router.navigate(['/host']);
        } else if (user.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Login failed. Please try again.';
        this.isLoading = false;
      },
    });
  }
}
