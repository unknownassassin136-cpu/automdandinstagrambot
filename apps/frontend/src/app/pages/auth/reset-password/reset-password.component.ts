import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);

  resetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
  
  isSubmitted = false;

  constructor() {}

  onSubmit() {
    if (this.resetForm.valid) {
      // Mock reset email sending
      console.log('Reset password for:', this.resetForm.value);
      this.isSubmitted = true;
    }
  }
}
