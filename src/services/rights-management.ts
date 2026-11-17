import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddOrRemoveRightsDTO } from '../Interfaces/add-or-remove-rights-dto';
import { environment } from '../Environments/environment';


@Injectable({
  providedIn: 'root'
})
export class RightsManagementService {
  private baseUrl = `${environment.apiBaseUrl}/RightsManagement`;

  constructor(private http: HttpClient) {}

  getByDLName(dlName: string, source: string): Observable<any> {
    // DL name is a path segment: encode it. Source always goes as a query parameter.
    return this.http.get(`${this.baseUrl}/${encodeURIComponent(dlName)}`, { params: { source } });
  }

  addOrRemoveRights(dto: AddOrRemoveRightsDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/AddOrRemoveRights`, dto);
  }
}
