import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.component.html',
})
export class AdminOverviewComponent {
  platformStats = [
    { label: 'Total Tenants', value: '1,245', trend: '+12%' },
    { label: 'Active Automations', value: '8,421', trend: '+5%' },
    { label: 'Webhooks Processed', value: '1.2M', trend: '+24%' },
    { label: 'MRR', value: '$45,200', trend: '+8%' }
  ];

  systemHealth = {
    database: 'Healthy',
    redis: 'Healthy',
    bullmq: 'Healthy',
    metaApi: 'Warning (Rate Limits)'
  };
}
