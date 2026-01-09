import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddOrRemoveRightsDTO } from '../Interfaces/add-or-remove-rights-dto';


@Injectable({
  providedIn: 'root'
})
export class RightsManagementService {
  private baseUrl = 'http://172.30.48.14:5000/api/RightsManagement';

  constructor(private http: HttpClient) {}

  getByDLName(dlName: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${dlName}`);
  }

  addOrRemoveRights(dto: AddOrRemoveRightsDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/AddOrRemoveRights`, dto);
  }
}
