import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface ConnectedAccount {
  id: string;
  facebookPageId: string;
  instagramBusinessAccountId: string;
  pageName: string;
  instagramUsername: string;
  isActive: boolean;
  aiDmEnabled: boolean;
  businessContext: string | null;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/accounts`;

  getAccounts(): Observable<ConnectedAccount[]> {
    return this.http.get<ConnectedAccount[]>(this.apiUrl);
  }

  connectAccount(code: string): Observable<ConnectedAccount> {
    return this.http.post<ConnectedAccount>(`${this.apiUrl}/connect`, { code });
  }

  disconnectAccount(accountId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${accountId}`);
  }

  getMedia(accountId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${accountId}/media`);
  }

  toggleAiDm(accountId: string, enabled: boolean): Observable<ConnectedAccount> {
    return this.http.patch<ConnectedAccount>(`${this.apiUrl}/${accountId}/ai-dm`, { enabled });
  }

  updateBusinessContext(accountId: string, businessContext: string): Observable<ConnectedAccount> {
    return this.http.patch<ConnectedAccount>(`${this.apiUrl}/${accountId}/business-context`, { businessContext });
  }
}
