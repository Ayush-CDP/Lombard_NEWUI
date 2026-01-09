import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountUnlockRequestDTO, AccountUnlockStatus, ApiResponse } from '../Interfaces/account-unlock-request-dto';



@Injectable({
  providedIn: 'root'
})
export class AccountUnlockService {
  private baseUrl = 'http://172.30.48.14:5000/api/AccountUnlock';

  constructor(private http: HttpClient) {}

getUserDetails(employeeId: string): Observable<ApiResponse<AccountUnlockStatus>> {
  return this.http.get<ApiResponse<AccountUnlockStatus>>(
    `${this.baseUrl}/${employeeId}`
  );
}

unlockAccount(request: AccountUnlockRequestDTO): Observable<ApiResponse<any>> {
  return this.http.post<ApiResponse<any>>(
    `${this.baseUrl}/unlock`,
    request
  );
}

}
