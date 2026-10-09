import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { apiUrl } from '../api-url';
import { AuthResponse } from '../model/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseURL = `${apiUrl()}/api/usuario`;

  constructor(private http: HttpClient) { }

  login(usuario: string, clave: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseURL}/login`, { usuario, clave }).pipe(
      tap(resp => this.guardar(resp))
    );
  }

  refresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseURL}/refresh`, { refreshToken: this.getRefresh() }).pipe(
      tap(resp => this.guardar(resp))
    );
  }

  logout(): void {
    localStorage.removeItem('inv_token');
    localStorage.removeItem('inv_refresh');
    localStorage.removeItem('inv_usuario');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hayRefresh(): boolean {
    return !!this.getRefresh();
  }

  getToken(): string | null {
    return localStorage.getItem('inv_token');
  }

  getUsuario(): string | null {
    return localStorage.getItem('inv_usuario');
  }

  esAdmin(): boolean {
    const t = this.getToken();
    if (!t) {
      return false;
    }
    try {
      const cuerpo = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const datos = JSON.parse(atob(cuerpo)) as { tipo?: string };
      return datos?.tipo === 'admin';
    } catch {
      return false;
    }
  }

  private getRefresh(): string | null {
    return localStorage.getItem('inv_refresh');
  }

  private guardar(resp: AuthResponse): void {
    localStorage.setItem('inv_token', resp.token);
    localStorage.setItem('inv_refresh', resp.refreshToken);
    localStorage.setItem('inv_usuario', resp.usuario);
  }
}
