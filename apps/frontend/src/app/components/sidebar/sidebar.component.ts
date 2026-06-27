import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SubscriptionsService } from '../../core/services/subscriptions.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  private subsService = inject(SubscriptionsService);
  private analyticsService = inject(AnalyticsService);
  layoutService = inject(LayoutService);
  private cdr = inject(ChangeDetectorRef);

  menuItems = [
    { label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', route: '/' },
    { label: 'Automations', icon: 'M13 10V3L4 14h7v7l9-11h-7z', route: '/automations' },
    { label: 'Accounts', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', route: '/accounts' },
    { label: 'AI Auto-Reply', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', route: '/ai-reply' },
    { label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', route: '/settings' },
  ];

  billingStatus: any = null;
  totalAutomations: number = 0;
  usagePercent: number = 0;

  ngOnInit() {
    this.subsService.getBillingStatus().subscribe({
      next: (status) => {
        this.billingStatus = status;
        this.calculateUsage();
      },
      error: (err) => console.error('Failed to load billing status in sidebar', err)
    });

    this.analyticsService.getDashboardStats().subscribe({
      next: (stats) => {
        this.totalAutomations = stats.totalAutomations || 0;
        this.calculateUsage();
      },
      error: (err) => console.error('Failed to load dashboard stats in sidebar', err)
    });
  }

  calculateUsage() {
    if (this.billingStatus && this.billingStatus.maxAutomations !== -1) {
      this.usagePercent = Math.min(100, Math.round((this.totalAutomations / this.billingStatus.maxAutomations) * 100));
    } else {
      this.usagePercent = 100; // if unlimited, just show full or handled by template
    }
    this.cdr.detectChanges();
  }
}
