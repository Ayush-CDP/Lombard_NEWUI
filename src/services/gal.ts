import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GALSearchEnum } from '../Enums/galsearch-enum';
import { GALResult } from '../Interfaces/GALResult';


@Injectable({
  providedIn: 'root'
})
export class GALService {
  private baseUrl = 'https://localhost:7184/api/GAL';

  constructor(private http: HttpClient) {}

  search(parameter: GALSearchEnum, value: string): Observable<any> {
    return this.http.get<GALResult>(`${this.baseUrl}/search`, {
      params: { parameter: parameter.toString(), value }
    });
  }
}
