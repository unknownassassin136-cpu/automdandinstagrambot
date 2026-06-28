import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AutomationsService, AutomationRule } from '../../../core/services/automations.service';
import { AccountsService, ConnectedAccount } from '../../../core/services/accounts.service';

interface MediaWithAutomation {
  media: any;
  rule: AutomationRule | null;
}

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

  activeAccount: ConnectedAccount | null = null;
  mediaWithRules: MediaWithAutomation[] = [];
  loading = true;
  automationsCount = 0;
  maxAutomations = 3; // Free plan limit

  ngOnInit() {
    this.accountsService.getAccounts().subscribe({
      next: (accounts) => {
        if (accounts.length > 0) {
          this.activeAccount = accounts[0];
          this.loadData();
        } else {
          this.loading = false;
        }
      },
      error: () => this.loading = false
    });
  }

  loadData() {
    if (!this.activeAccount) return;
    
    forkJoin({
      media: this.accountsService.getMedia(this.activeAccount.id),
      rules: this.automationsService.getRules(this.activeAccount.id)
    }).subscribe({
      next: ({ media, rules }) => {
        this.automationsCount = rules.length;
        
        // Map media items to their corresponding rule
        this.mediaWithRules = media.map(m => {
          const rule = rules.find(r => (r as any).targetMediaId === m.id) || null;
          return { media: m, rule };
        });

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch automations data:', err);
        this.loading = false;
      }
    });
  }

  deleteAutomation(ruleId: string) {
    if (confirm('Are you sure you want to completely delete this automation rule? This action cannot be undone.')) {
      this.automationsService.deleteRule(ruleId).subscribe({
        next: () => {
          this.automationsCount--;
          const item = this.mediaWithRules.find(m => m.rule?.id === ruleId);
          if (item) item.rule = null;
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
