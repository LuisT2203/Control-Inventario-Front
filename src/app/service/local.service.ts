import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../api-url';
import { MensajeResponse } from '../model/mensaje-response';

@Injectable({
  providedIn: 'root'
})
export class LocalService {

  private baseURL = `${apiUrl()}/ControladorLocal`;

  constructor(private http: HttpClient) { }

  listarLocales(): Observable<MensajeResponse> {
    return this.http.get<MensajeResponse>(`${this.baseURL}/listarLocales`);
  }
}
