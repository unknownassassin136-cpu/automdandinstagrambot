import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AccountsService, ConnectedAccount } from '../../core/services/accounts.service';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts.component.html',
})
export class AccountsComponent implements OnInit {
  private accountsService = inject(AccountsService);
  private cdr = inject(ChangeDetectorRef);
  
  connectedAccounts: ConnectedAccount[] = [];

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.accountsService.getAccounts().subscribe({
      next: (accounts) => {
        this.connectedAccounts = accounts;
        this.cdr.detectChanges();
      },
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

  toggleAiDm(account: ConnectedAccount) {
    this.accountsService.toggleAiDm(account.id, account.aiDmEnabled).subscribe({
      next: (updated) => {
        const index = this.connectedAccounts.findIndex(a => a.id === updated.id);
        if (index !== -1) {
          this.connectedAccounts[index] = updated;
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        console.error('Failed to toggle AI DM', err);
        // Revert toggle
        account.aiDmEnabled = !account.aiDmEnabled;
        this.cdr.detectChanges();
      }
    });
  }

  saveBusinessContext(account: ConnectedAccount) {
    if (account.businessContext) {
      this.accountsService.updateBusinessContext(account.id, account.businessContext).subscribe({
        next: (updated) => {
          const index = this.connectedAccounts.findIndex(a => a.id === updated.id);
          if (index !== -1) {
            this.connectedAccounts[index] = updated;
            alert('Business Context Saved Successfully!');
            this.cdr.detectChanges();
          }
        },
        error: (err: any) => {
          console.error('Failed to update business context', err);
          alert('Failed to save business context.');
        }
      });
    }
  }
}
