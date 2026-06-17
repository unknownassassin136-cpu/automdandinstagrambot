import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {
  private apiUrl = `${environment.apiUrl}/subscriptions`;

  constructor(private http: HttpClient) {}

  getBillingStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/status`);
  }

  mockUpgrade(planName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mock-upgrade`, { planName });
  }
}
