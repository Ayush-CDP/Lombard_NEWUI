import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../Environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApprovalService {
  private baseUrl = `${environment.apiBaseUrl}/Approval`;

  constructor(private http: HttpClient) {}

  // Fetch request details
  getRequest(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/request/${encodeURIComponent(id)}`);
  }

  // Approve / reject are POSTs triggered by a button click on the approval page.
  // Never expose them as GET links in the email (mail scanners would trigger them).
  // Both endpoints return plain text, e.g. "Approved Successfully".
  approve(id: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/approve/${encodeURIComponent(id)}`, null, { responseType: 'text' });
  }

  reject(id: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/reject/${encodeURIComponent(id)}`, null, { responseType: 'text' });
  }
}
