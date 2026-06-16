import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface AutomationRule {
  id?: string;
  accountId: string;
  triggerKeyword: string;
  replyCommentText?: string;
  dmTemplateText?: string;
  isActive: boolean;
}

export interface AutomationTemplate {
  id?: string;
  accountId: string;
  ruleId: string;
  replyType: string;
  commentTemplate?: string;
  dmTemplate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutomationsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/automations`;

  // Rules
  getRules(accountId: string): Observable<AutomationRule[]> {
    return this.http.get<AutomationRule[]>(`${this.apiUrl}/rules?accountId=${accountId}`);
  }

  createRule(rule: Partial<AutomationRule>): Observable<AutomationRule> {
    return this.http.post<AutomationRule>(`${this.apiUrl}/rules`, rule);
  }

  updateRule(ruleId: string, rule: Partial<AutomationRule>): Observable<AutomationRule> {
    return this.http.put<AutomationRule>(`${this.apiUrl}/rules/${ruleId}`, rule);
  }

  deleteRule(ruleId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/rules/${ruleId}`);
  }

  // Templates
  createTemplate(template: Partial<AutomationTemplate>): Observable<AutomationTemplate> {
    return this.http.post<AutomationTemplate>(`${this.apiUrl}/templates`, template);
  }
}
