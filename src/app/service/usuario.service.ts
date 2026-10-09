import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../api-url';
import { Usuario } from '../model/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private baseURL = `${apiUrl()}/api/usuario`;

  constructor(private http: HttpClient) { }

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseURL}/listar`);
  }

  crear(usuario: string, clave: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseURL}/crear`, { usuario, clave });
  }

  cambiarEstado(id: number, estado: boolean): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseURL}/estado/${id}`, { estado });
  }

  cambiarClave(id: number, clave: string): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseURL}/clave/${id}`, { clave });
  }
}
