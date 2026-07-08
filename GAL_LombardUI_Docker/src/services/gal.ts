import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GALSearchEnum } from '../Enums/galsearch-enum';
import { GALResult } from '../Interfaces/GALResult';
import { environment } from '../Environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GALService {
  private baseUrl = `${environment.apiBaseUrl}/GAL`;

  constructor(private http: HttpClient) {}

  // search(parameter: GALSearchEnum, value: string): Observable<GALResult> {
  //   const params = new HttpParams()
  //     .set('parameter', GALSearchEnum[parameter]) 
  //     .set('value', value);

  //   return this.http.get<GALResult>(`${this.baseUrl}/search`, { params });
  // }

  search(parameter: GALSearchEnum, value: string): Observable<GALResult[]> {
  const params = new HttpParams()
    .set('parameter', GALSearchEnum[parameter])
    .set('value', value);

  return this.http.get<GALResult[]>(`${this.baseUrl}/search`, { params });
}

}
