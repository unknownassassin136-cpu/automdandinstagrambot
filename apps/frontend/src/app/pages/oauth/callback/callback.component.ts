import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountsService } from '../../../core/services/accounts.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="card max-w-md w-full p-8 text-center">
        @if (loading) {
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary)] border-t-transparent mb-4"></div>
          <h2 class="text-xl font-bold text-[var(--color-text)] mb-2">Connecting your account...</h2>
          <p class="text-[var(--color-text-secondary)]">Please wait while we securely connect to Meta.</p>
        } @else if (error) {
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-[var(--color-text)] mb-2">Connection Failed</h2>
          <p class="text-[var(--color-danger)] mb-6">{{ error }}</p>
          <button (click)="goBack()" class="btn-primary w-full">Back to Settings</button>
        } @else {
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-[var(--color-text)] mb-2">Successfully Connected!</h2>
          <p class="text-[var(--color-text-secondary)]">Your Instagram account is now linked.</p>
        }
      </div>
    </div>
  `
})
export class CallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accountsService = inject(AccountsService);

  loading = true;
  error = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const error = params['error'];
      const errorReason = params['error_reason'];

      if (error) {
        this.loading = false;
        this.error = `Meta returned an error: ${errorReason || error}`;
        return;
      }

      if (!code) {
        this.loading = false;
        this.error = 'No authorization code found in the URL.';
        return;
      }

      // We have a code, let's send it to our backend
      this.accountsService.connectAccount(code).subscribe({
        next: (account) => {
          this.loading = false;
          // Successfully connected, redirect back to settings after a short delay
          setTimeout(() => {
            this.router.navigate(['/settings']);
          }, 1500);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.error || err.message || 'Failed to connect account.';
        }
      });
    });
  }

  goBack() {
    this.router.navigate(['/settings']);
  }
}
