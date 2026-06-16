import { Component } from '@angular/core';
import { StatsCardComponent } from '../../components/stats-card/stats-card.component';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatsCardComponent, DatePipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  today = new Date();
  
  stats = [
    {
      title: 'Total Automations',
      value: '24',
      change: 12,
      iconPath: 'M13 10V3L4 14h7v7l9-11h-7z'
    },
    {
      title: 'Comments Replied',
      value: '1,429',
      change: 34,
      iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
    },
    {
      title: 'DMs Sent',
      value: '845',
      change: 5,
      iconPath: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
    },
    {
      title: 'Conversion Rate',
      value: '14.2%',
      change: -2,
      iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
    }
  ];

  recentActivity = [
    { type: 'comment', account: '@nike', rule: 'Summer Sale Auto-DM', time: '2 minutes ago' },
    { type: 'dm', account: '@adidas', rule: 'Welcome Message', time: '15 minutes ago' },
    { type: 'comment', account: '@puma', rule: 'Summer Sale Auto-DM', time: '1 hour ago' },
    { type: 'system', account: 'System', rule: 'Monthly limit reset', time: '1 day ago' }
  ];
}
