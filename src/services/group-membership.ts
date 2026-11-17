import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AddOrRemoveDLMembershipDTO } from '../Interfaces/add-or-remove-dlmembership-dto';
import { Observable } from 'rxjs';
import { environment } from '../Environments/environment';

@Injectable({ providedIn: 'root' })
export class GroupMembershipService {
  private readonly baseUrl = `${environment.apiBaseUrl}/GroupMembership`;

  constructor(private http: HttpClient) {}

getByDLName(dlName: string, source: string): Observable<any> {
  // DL name is a path segment: encode it. Source always goes as a query parameter.
    return this.http.get(`${this.baseUrl}/${encodeURIComponent(dlName)}`, { params: { source } });
}

  addOrRemoveDLMembership(dto: AddOrRemoveDLMembershipDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/AddOrRemoveDLMembership`, dto);
  }
}
