import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GALSearchEnum } from '../Enums/galsearch-enum';
import { GALResult } from '../Interfaces/GALResult';

@Injectable({
  providedIn: 'root'
})
export class GALService {
  private baseUrl = 'http://172.30.48.14:5000/api/GAL';

  constructor(private http: HttpClient) {}

  search(parameter: GALSearchEnum, value: string): Observable<GALResult> {
    const params = new HttpParams()
      .set('parameter', GALSearchEnum[parameter]) 
      .set('value', value);

    return this.http.get<GALResult>(`${this.baseUrl}/search`, { params });
  }
}
