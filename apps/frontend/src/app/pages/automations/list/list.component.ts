import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { AutomationsService, AutomationRule } from '../../../core/services/automations.service';
import { AccountsService, ConnectedAccount } from '../../../core/services/accounts.service';

@Component({
  selector: 'app-automations-list',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './list.component.html',
})
export class AutomationsListComponent implements OnInit {
  private automationsService = inject(AutomationsService);
  private accountsService = inject(AccountsService);
  private cdr = inject(ChangeDetectorRef);

  automations: AutomationRule[] = [];
  loading = true;
  activeAccount: ConnectedAccount | null = null;

  ngOnInit() {
    this.accountsService.getAccounts().subscribe({
      next: (accounts) => {
        if (accounts.length > 0) {
          this.activeAccount = accounts[0];
          this.loadAutomations();
        } else {
          this.loading = false;
        }
      },
      error: () => this.loading = false
    });
  }

  loadAutomations() {
    if (!this.activeAccount) return;
    
    this.automationsService.getRules(this.activeAccount.id).subscribe({
      next: (rules) => {
        console.log('Fetched automations from backend:', rules);
        this.automations = rules;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch automations:', err);
        this.loading = false;
      }
    });
  }

  deleteAutomation(ruleId: string) {
    if (confirm('Are you sure you want to completely delete this automation rule? This action cannot be undone.')) {
      this.automationsService.deleteRule(ruleId).subscribe({
        next: () => {
          this.automations = this.automations.filter(r => r.id !== ruleId);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to delete automation:', err);
          alert('Failed to delete automation rule.');
        }
      });
    }
  }
}
