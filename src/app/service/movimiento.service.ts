import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../api-url';
import { MensajeResponse } from '../model/mensaje-response';
import { Cambio, Devolucion, Movimiento, ReciboCambio, ReciboCompra, ReciboVenta, VentaResumen } from '../model/movimiento';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {

  private baseURL = `${apiUrl()}/ControladorMovimiento`;

  constructor(private http: HttpClient) { }

  guardar(m: Movimiento): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.baseURL}/saveMovimiento`, m);
  }

  guardarCambio(c: Cambio): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.baseURL}/saveCambio`, c);
  }

  guardarDevolucion(d: Devolucion): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.baseURL}/saveDevolucion`, d);
  }

  verCambio(id: number): Observable<ReciboCambio> {
    return this.http.get<ReciboCambio>(`${this.baseURL}/cambio/${id}`);
  }

  listarCambios(localId: number, dias = 30): Observable<MensajeResponse> {
    const params = new HttpParams().set('localId', localId).set('dias', dias);
    return this.http.get<MensajeResponse>(`${this.baseURL}/listarCambios`, { params });
  }

  listarVentas(localId: number, dias = 30): Observable<MensajeResponse> {
    const params = new HttpParams().set('localId', localId).set('dias', dias);
    return this.http.get<MensajeResponse>(`${this.baseURL}/listarVentas`, { params });
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
