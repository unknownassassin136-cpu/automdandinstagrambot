import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { StatsCardComponent } from '../../components/stats-card/stats-card.component';
import { CommonModule, DatePipe } from '@angular/common';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatsCardComponent, DatePipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  today = new Date();
  
  metrics: any = {
    totalAutomations: 0,
    repliesSent: 0,
    dmsSent: 0,
    connectedAccounts: 0
  };
  
  recentActivity: any[] = [];
  private pollingInterval: any;

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    // Poll every 30 seconds to keep stats live and prevent backend from sleeping
    this.pollingInterval = setInterval(() => {
      this.loadDashboardData();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  loadDashboardData() {
    // Fetch stats
    this.analyticsService.getDashboardStats().subscribe({
      next: (data) => {
        console.log('Dashboard Stats Received:', data);
        this.metrics = {
          totalAutomations: data?.totalAutomations ?? 0,
          repliesSent: data?.repliesSent ?? 0,
          dmsSent: data?.dmsSent ?? 0,
          connectedAccounts: data?.connectedAccounts ?? 0
        };
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching stats:', err);
        // Fallback to empty stats so it doesn't break
        this.metrics = {
          totalAutomations: 0,
          repliesSent: 0,
          dmsSent: 0,
          connectedAccounts: 0
        };
        this.cdr.detectChanges();
      }
    });

    // Fetch recent logs
    this.analyticsService.getRecentLogs().subscribe({
      next: (logs) => {
        console.log('Recent Logs Received:', logs);
        this.recentActivity = (logs || []).map((log: any) => ({
          type: log.actionType.includes('comment') ? 'comment' : log.actionType.includes('dm') ? 'dm' : 'system',
          account: log.accountName || 'Unknown Account',
          rule: log.status === 'success' ? 'Successful' : `Failed: ${log.errorMessage}`,
          time: log.createdAt
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching logs', err);
        this.cdr.detectChanges();
      }
    });
  }
}

