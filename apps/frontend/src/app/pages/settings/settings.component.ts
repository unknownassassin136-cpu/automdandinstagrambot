import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AccountsService, ConnectedAccount } from '../../core/services/accounts.service';
import { SubscriptionsService } from '../../core/services/subscriptions.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private accountsService = inject(AccountsService);
  private subsService = inject(SubscriptionsService);
  activeTab = 'profile';
  
  connectedAccounts: ConnectedAccount[] = [];

  profileForm = this.fb.group({
    companyName: ['Acme Corp', Validators.required],
    fullName: ['Jane Doe', Validators.required],
    email: ['jane@acme.com', [Validators.required, Validators.email]]
  });

  billingStatus: any = null;
  
  billingPlans = [
    { id: 'free', name: 'Free', price: '$0', features: ['1 Instagram Account', '3 Automation Rules', '10 Auto-replies/mo'] },
    { id: 'plus', name: 'Plus', price: '$29/mo', features: ['1 Instagram Account', '5 Automation Rules', '20 Auto-replies/mo'] },
    { id: 'pro', name: 'Pro', price: '$99/mo', features: ['Unlimited Accounts', 'Unlimited Automations', 'Unlimited Replies'] }
  ];

  sessions = [
    { device: 'MacBook Pro (Chrome)', location: 'San Francisco, CA', time: 'Active now', current: true },
    { device: 'iPhone 14 Pro (Safari)', location: 'San Francisco, CA', time: 'Last active 2 hours ago', current: false }
  ];

  ngOnInit() {
    this.loadAccounts();
    this.loadBilling();
  }

  loadAccounts() {
    this.accountsService.getAccounts().subscribe({
      next: (accounts) => this.connectedAccounts = accounts,
      error: (err: any) => console.error('Failed to load accounts', err)
    });
  }

  loadBilling() {
    this.subsService.getBillingStatus().subscribe({
      next: (status) => this.billingStatus = status,
      error: (err: any) => console.error('Failed to load billing status', err)
    });
  }

  upgradePlan(planId: string) {
    if (confirm(`Mock Upgrade: Are you sure you want to switch to the ${planId} plan?`)) {
      this.subsService.mockUpgrade(planId).subscribe({
        next: (status) => {
          this.billingStatus = status;
          alert(`Successfully switched to ${status.planName}`);
        },
        error: (err: any) => {
          console.error('Failed to upgrade', err);
          alert('Failed to upgrade plan');
        }
      });
    }
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
