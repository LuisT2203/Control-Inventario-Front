export interface Movimiento {
  idMovimiento?: number;
  idProducto: number;
  nombreProducto?: string;
  codigoProducto?: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'DEVOLUCION';
  cantidad: number;
  fechaHora?: string;
  saldoResultante?: number;
  personaRetira?: string | null;
  destino?: string | null;
  costoUnitario?: number | null;
  precioUnitario?: number | null;
  grupoCambio?: string | null;
  grupoVenta?: string | null;
  grupoCompra?: string | null;
  idVenta?: number | null;
  idCompra?: number | null;
  motivo?: string | null;
}

export interface Cambio {
  idProductoEntra: number;
  cantidadEntra: number;
  idProductoSale: number;
  cantidadSale: number;
  personaRetira?: string | null;
  destino?: string | null;
  precioUnitario?: number | null;
}

export interface Kardex {
  producto: import('./producto').Producto;
  movimientos: Movimiento[];
}

export interface ReciboVenta {
  idVenta: number;
  fechaHora: string;
  total: number;
  lineas: Movimiento[];
}

export interface ReciboCompra {
  idCompra: number;
  fechaHora: string;
  total: number;
  lineas: Movimiento[];
}
