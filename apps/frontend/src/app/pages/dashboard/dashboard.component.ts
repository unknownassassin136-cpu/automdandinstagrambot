import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { StatsCardComponent } from '../../components/stats-card/stats-card.component';
import { CommonModule, DatePipe } from '@angular/common';
import { AnalyticsService } from '../../core/services/analytics.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatsCardComponent, DatePipe, BaseChartDirective],
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

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0.4 // smooth curve
      }
    },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  public chartData: ChartData<'bar'> = {
    labels: ['Replies', 'DMs', 'Automations', 'Accounts'],
    datasets: [
      { 
        data: [0, 0, 0, 0], 
        label: 'Count',
        backgroundColor: 'rgba(124, 58, 237, 0.8)', // Neon purple
        borderColor: '#7c3aed',
        borderWidth: 2,
        hoverBackgroundColor: '#8b5cf6',
        borderRadius: 4,
      }
    ]
  };

  public chartType: ChartType = 'bar';

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

        // Update chart data
        this.chartData.datasets[0].data = [
          this.metrics.repliesSent,
          this.metrics.dmsSent,
          this.metrics.totalAutomations,
          this.metrics.connectedAccounts
        ];
        this.chart?.update();

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
        this.chartData.datasets[0].data = [0, 0, 0, 0];
        this.chart?.update();
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

