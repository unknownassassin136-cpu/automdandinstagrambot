import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  isMenuOpen = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  themeService = inject(ThemeService);
  layoutService = inject(LayoutService);

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }


  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
