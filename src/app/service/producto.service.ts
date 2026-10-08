import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../api-url';
import { MensajeResponse } from '../model/mensaje-response';
import { Producto } from '../model/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private baseURL = `${apiUrl()}/ControladorProducto`;

  constructor(private http: HttpClient) { }

  listarProductos(localId: number, bajoStock = false): Observable<MensajeResponse> {
    const params = new HttpParams()
      .set('localId', localId)
      .set('bajoStock', bajoStock);
    return this.http.get<MensajeResponse>(`${this.baseURL}/listarProductos`, { params });
  }

  buscar(localId: number, texto = '', categoria = '', bajoStock = false, pagina = 0, tamano = 20, sinPrecio = false): Observable<MensajeResponse> {
    const params = new HttpParams()
      .set('localId', localId)
      .set('texto', texto)
      .set('categoria', categoria)
      .set('bajoStock', bajoStock)
      .set('sinPrecio', sinPrecio)
      .set('pagina', pagina)
      .set('tamano', tamano);
    return this.http.get<MensajeResponse>(`${this.baseURL}/buscarProductos`, { params });
  }

  categorias(localId: number): Observable<MensajeResponse> {
    const params = new HttpParams().set('localId', localId);
    return this.http.get<MensajeResponse>(`${this.baseURL}/listarCategorias`, { params });
  }

  conteoCategorias(localId: number): Observable<MensajeResponse> {
    const params = new HttpParams().set('localId', localId);
    return this.http.get<MensajeResponse>(`${this.baseURL}/contarCategorias`, { params });
  }

  siguienteCodigo(localId: number, categoria: string): Observable<MensajeResponse> {
    const params = new HttpParams().set('localId', localId).set('categoria', categoria);
    return this.http.get<MensajeResponse>(`${this.baseURL}/siguienteCodigo`, { params });
  }

  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseURL}/editarProducto/${id}`);
  }

  guardar(p: Producto): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.baseURL}/saveProducto`, p);
  }

  actualizar(p: Producto): Observable<MensajeResponse> {
    return this.http.put<MensajeResponse>(`${this.baseURL}/updateProducto`, p);
  }

  eliminar(id: number): Observable<MensajeResponse> {
    return this.http.delete<MensajeResponse>(`${this.baseURL}/eliminarProducto/${id}`);
  }

  actualizarPrecioCosto(idProducto: number, precioVenta: number | null, costoReferencia: number | null): Observable<MensajeResponse> {
    return this.http.put<MensajeResponse>(`${this.baseURL}/updatePrecioCosto`, { idProducto, precioVenta, costoReferencia });
  }

  actualizarPreciosCostos(lineas: { idProducto: number; precioVenta: number | null; costoReferencia: number | null }[]): Observable<MensajeResponse> {
    return this.http.put<MensajeResponse>(`${this.baseURL}/updatePreciosCostos`, lineas);
  }
}
