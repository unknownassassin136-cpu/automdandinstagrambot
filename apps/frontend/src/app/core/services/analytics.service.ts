import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  getRecentLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/logs?limit=5`);
  }

  getAiStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ai`);
  }
}
