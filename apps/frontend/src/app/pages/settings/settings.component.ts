import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AccountsService, ConnectedAccount } from '../../core/services/accounts.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  private fb = inject(FormBuilder);
  private accountsService = inject(AccountsService);
  activeTab = 'profile';
  
  connectedAccounts: ConnectedAccount[] = [];

  profileForm = this.fb.group({
    companyName: ['Acme Corp', Validators.required],
    fullName: ['Jane Doe', Validators.required],
    email: ['jane@acme.com', [Validators.required, Validators.email]]
  });

  billingPlans = [
    { name: 'Free', price: '$0', features: ['1 Instagram Account', '100 Auto-replies/mo'], current: false },
    { name: 'Pro', price: '$29/mo', features: ['5 Instagram Accounts', '10,000 Auto-replies/mo', 'Priority Support'], current: true },
    { name: 'Enterprise', price: '$99/mo', features: ['Unlimited Accounts', 'Unlimited Replies', 'Dedicated Manager'], current: false }
  ];

  sessions = [
    { device: 'MacBook Pro (Chrome)', location: 'San Francisco, CA', time: 'Active now', current: true },
    { device: 'iPhone 14 Pro (Safari)', location: 'San Francisco, CA', time: 'Last active 2 hours ago', current: false }
  ];

  constructor() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.accountsService.getAccounts().subscribe({
      next: (accounts) => this.connectedAccounts = accounts,
      error: (err: any) => console.error('Failed to load accounts', err)
    });
  }

  loginWithInstagram() {
    const clientId = environment.instagramAppId;
    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/callback`);
    const scopes = 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments';
    const oauthUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}`;
    
    window.location.href = oauthUrl;
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  disconnectAccount(accountId: string) {
    if (confirm('Are you sure you want to disconnect this Instagram account? This will stop all active automations.')) {
      this.accountsService.disconnectAccount(accountId).subscribe({
        next: () => {
          this.connectedAccounts = this.connectedAccounts.filter(acc => acc.id !== accountId);
        },
        error: (err: any) => console.error('Failed to disconnect account', err)
      });
    }
  }

  saveProfile() {
    console.log('Profile saved', this.profileForm.value);
  }
}
