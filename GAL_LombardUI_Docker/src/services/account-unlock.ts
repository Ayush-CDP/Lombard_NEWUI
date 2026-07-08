import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountUnlockRequestDTO, AccountUnlockStatus, ApiResponse } from '../Interfaces/account-unlock-request-dto';
import { environment } from '../Environments/environment';



@Injectable({
  providedIn: 'root'
})
export class AccountUnlockService {
  private baseUrl = `${environment.apiBaseUrl}/account-unlock`;

  constructor(private http: HttpClient) {}

getUserDetails(employeeId: string): Observable<ApiResponse<AccountUnlockStatus>> {
  console.log(this.baseUrl);
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
