import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AddOrRemoveDLMembershipDTO } from '../Interfaces/add-or-remove-dlmembership-dto';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GroupMembershipService {
  private readonly baseUrl = 'https://localhost:7184/api/GroupMembership';

  constructor(private http: HttpClient) {}

  getByDLName(dlName: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${dlName}`);
  }

  addOrRemoveDLMembership(dto: AddOrRemoveDLMembershipDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/AddOrRemoveDLMembership`, dto);
  }
}
