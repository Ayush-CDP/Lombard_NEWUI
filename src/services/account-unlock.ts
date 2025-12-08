import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountUnlockRequestDTO } from '../Interfaces/account-unlock-request-dto';



@Injectable({
  providedIn: 'root'
})
export class AccountUnlockService {
  private baseUrl = 'https://localhost:7184/api/AccountUnlock';

  constructor(private http: HttpClient) {}

  getUserDetails(employeeId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${employeeId}`);
  }

  unlockAccount(request: AccountUnlockRequestDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/unlock`, request);
  }
}
