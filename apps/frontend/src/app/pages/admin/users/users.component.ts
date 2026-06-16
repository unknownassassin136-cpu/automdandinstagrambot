import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
})
export class AdminUsersComponent {
  users = [
    { id: '1', name: 'Acme Corp', email: 'admin@acme.com', plan: 'Enterprise', status: 'Active', joined: 'Oct 1, 2024' },
    { id: '2', name: 'StartUp Inc', email: 'hello@startup.io', plan: 'Pro', status: 'Active', joined: 'Jan 15, 2025' },
    { id: '3', name: 'Local Shop', email: 'contact@localshop.com', plan: 'Free', status: 'Suspended', joined: 'Mar 4, 2026' }
  ];
}
