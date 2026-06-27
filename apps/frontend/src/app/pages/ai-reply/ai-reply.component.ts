import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountsService, ConnectedAccount } from '../../core/services/accounts.service';

@Component({
  selector: 'app-ai-reply',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-reply.component.html',
})
export class AiReplyComponent implements OnInit {
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
