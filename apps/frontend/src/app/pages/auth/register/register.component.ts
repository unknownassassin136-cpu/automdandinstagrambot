import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  loading = false;
  error = '';

  registerForm = this.fb.group({
    companyName: ['', Validators.required],
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor() {}

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';

      const { fullName, email, password } = this.registerForm.value;
      const [firstName, ...lastNames] = (fullName || '').split(' ');
      const lastName = lastNames.join(' ') || 'User';

      const payload = {
        firstName,
        lastName,
        email,
        password
      };

      this.authService.register(payload).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.error || 'Failed to register';
        }
      });
    }
  }
}
