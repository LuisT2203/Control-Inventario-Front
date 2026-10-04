import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MensajeResponse } from '../model/mensaje-response';
import { Cambio, Movimiento, ReciboCompra, ReciboVenta } from '../model/movimiento';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {

  private baseURL = `${environment.API_URL}/ControladorMovimiento`;

  constructor(private http: HttpClient) { }

  guardar(m: Movimiento): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.baseURL}/saveMovimiento`, m);
  }

  guardarCambio(c: Cambio): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.baseURL}/saveCambio`, c);
  }

  guardarVenta(lineas: { idProducto: number; cantidad: number }[]): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.baseURL}/saveVenta`, { lineas });
  }

  guardarCompra(lineas: { idProducto: number; cantidad: number; costoUnitario?: number | null }[], motivo?: string): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.baseURL}/saveCompra`, { lineas, motivo });
  }

  verVenta(id: number): Observable<ReciboVenta> {
    return this.http.get<ReciboVenta>(`${this.baseURL}/venta/${id}`);
  }

  verCompra(id: number): Observable<ReciboCompra> {
    return this.http.get<ReciboCompra>(`${this.baseURL}/compra/${id}`);
  }

  recientes(localId: number, dias = 1, idProducto?: number): Observable<MensajeResponse> {
    let params = new HttpParams().set('localId', localId).set('dias', dias);
    if (idProducto) {
      params = params.set('idProducto', idProducto);
    }
    return this.http.get<MensajeResponse>(`${this.baseURL}/listarRecientes`, { params });
  }

  kardex(idProducto: number): Observable<MensajeResponse> {
    return this.http.get<MensajeResponse>(`${this.baseURL}/listarKardex/${idProducto}`);
  }
}
