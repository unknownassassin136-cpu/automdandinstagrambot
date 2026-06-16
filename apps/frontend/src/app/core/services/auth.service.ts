import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../http/api.service';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  currentUser = signal<any>(null);

  constructor() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.currentUser.set(JSON.parse(user));
    }
  }

  login(credentials: any) {
    return this.api.post<{user: any, tokens: any}>('/auth/login', credentials).pipe(
      tap(res => {
        if (res.tokens) {
          this.setSession(res.tokens.accessToken, res.user);
        }
      })
    );
  }

  register(userData: any) {
    return this.api.post<{user: any, tokens: any}>('/auth/register', userData).pipe(
      tap(res => {
        if (res.tokens) {
          this.setSession(res.tokens.accessToken, res.user);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  private setSession(token: string, user: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }
}
