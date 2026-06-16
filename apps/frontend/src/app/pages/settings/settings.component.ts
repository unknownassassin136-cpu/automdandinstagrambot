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

  loginWithFacebook() {
    const clientId = environment.metaAppId;
    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/callback`);
    const scopes = 'instagram_basic,instagram_manage_messages,instagram_manage_comments,pages_show_list,pages_read_engagement';
    const oauthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=code`;
    
    window.location.href = oauthUrl;
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  saveProfile() {
    console.log('Profile saved', this.profileForm.value);
  }
}
