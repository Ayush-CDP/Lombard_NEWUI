import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApprovalService {
  private baseUrl = 'https://localhost:7184/api/Approval';

  constructor(private http: HttpClient) {}

  // Fetch request details
  getRequest(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/request/${id}`);
  }

  // Approve request
  approve(id: string): Observable<string> {
    return this.http.get(`${this.baseUrl}/approve/${id}`, { responseType: 'text' });
  }

  // Reject request
  reject(id: string): Observable<string> {
    return this.http.get(`${this.baseUrl}/reject/${id}`, { responseType: 'text' });
  }
}
