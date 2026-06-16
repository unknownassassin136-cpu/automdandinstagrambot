import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  adminMenu = [
    { label: 'Overview', route: '/admin' },
    { label: 'Users', route: '/admin/users' },
    { label: 'Audit Logs', route: '/admin/audit-logs' },
    { label: 'Webhooks', route: '/admin/webhooks' },
    { label: 'Announcements', route: '/admin/announcements' },
  ];
}
