import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { SubscriptionsService } from '../../core/services/subscriptions.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private subsService = inject(SubscriptionsService);
  private cdr = inject(ChangeDetectorRef);
  activeTab = 'profile';

  profileForm = this.fb.group({
    companyName: ['Acme Corp', Validators.required],
    fullName: ['Jane Doe', Validators.required],
    email: ['jane@acme.com', [Validators.required, Validators.email]]
  });

  billingStatus: any = null;
  
  billingPlans = [
    { id: 'free', name: 'Free', price: '$0', features: ['1 Instagram Account', '3 Automation Rules', '10 Replies per automation'] },
    { id: 'plus', name: 'Plus', price: '$29/mo', features: ['1 Instagram Account', '5 Automation Rules', '20 Replies per automation'] },
    { id: 'pro', name: 'Pro', price: '$99/mo', features: ['Unlimited Accounts', 'Unlimited Automations', 'Unlimited Replies'] }
  ];

  aiPlan = {
    id: 'ai_addon', name: 'AI Add-on', price: '$50/mo', features: ['Intelligent Contextual Replies', 'Automatic Spam Filtering', 'Handles Custom Business FAQs']
  };

  sessions = [
    { device: 'MacBook Pro (Chrome)', location: 'San Francisco, CA', time: 'Active now', current: true },
    { device: 'iPhone 14 Pro (Safari)', location: 'San Francisco, CA', time: 'Last active 2 hours ago', current: false }
  ];

  ngOnInit() {
    this.loadBilling();
  }

  loadBilling() {
    this.subsService.getBillingStatus().subscribe({
      next: (status) => {
        this.billingStatus = status;
        this.cdr.detectChanges();
      },
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

  toggleAiPlan() {
    const isCurrentlyEnabled = this.billingStatus?.hasAiAddon;
    const action = isCurrentlyEnabled ? 'disable' : 'enable';
    
    if (confirm(`Mock Action: Are you sure you want to ${action} the AI Add-on?`)) {
      this.subsService.mockAiUpgrade(!isCurrentlyEnabled).subscribe({
        next: (status) => {
          this.billingStatus = status;
          alert(`Successfully ${!isCurrentlyEnabled ? 'enabled' : 'disabled'} AI features`);
        },
        error: (err: any) => {
          console.error('Failed to toggle AI plan', err);
          alert('Failed to update AI plan');
        }
      });
    }
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  saveProfile() {
    console.log('Profile saved', this.profileForm.value);
    alert('Profile saved successfully!');
  }
}
