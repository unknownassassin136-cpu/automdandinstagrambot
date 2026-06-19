import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StatsCardComponent } from '../../components/stats-card/stats-card.component';
import { CommonModule, DatePipe } from '@angular/common';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatsCardComponent, DatePipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  today = new Date();
  
  stats: any[] = [];
  recentActivity: any[] = [];

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Fetch stats
    this.analyticsService.getDashboardStats().subscribe({
      next: (data) => {
        console.log('Dashboard Stats Received:', data);
        this.stats = [
          {
            title: 'Total Automations',
            value: (data?.totalAutomations ?? 0).toString(),
            change: 0,
            iconPath: 'M13 10V3L4 14h7v7l9-11h-7z'
          },
          {
            title: 'Comments Replied',
            value: (data?.repliesSent ?? 0).toString(),
            change: 0,
            iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
          },
          {
            title: 'DMs Sent',
            value: (data?.dmsSent ?? 0).toString(),
            change: 0,
            iconPath: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
          },
          {
            title: 'Connected Accounts',
            value: (data?.connectedAccounts ?? 0).toString(),
            change: 0,
            iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
          }
        ];
        console.log('Stats mapped:', this.stats);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching stats:', err);
        // Fallback to empty stats so it doesn't break
        this.stats = [];
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

