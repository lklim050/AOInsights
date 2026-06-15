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

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['USER'],
      // ↑ Default role is USER — HOST can be selected in the form
    });
  }

  get name() {
    return this.registerForm.get('name');
  }
  get email() {
    return this.registerForm.get('email');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get role() {
    return this.registerForm.get('role');
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password, role } = this.registerForm.value;

    this.authService.register(email, name, password, role).subscribe({
      next: () => {
        this.successMessage = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
        // ↑ Brief success message before redirect
      },
      error: (err) => {
        this.errorMessage =
          err.error?.msg || 'Registration failed. Please try again.';
        this.isLoading = false;
      },
    });
  }
}
