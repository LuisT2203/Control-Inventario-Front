export interface Movimiento {
  idMovimiento?: number;
  idProducto: number;
  nombreProducto?: string;
  codigoProducto?: string;
  tallaProducto?: string | null;
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
  motivo?: string | null;
  idVenta: number;
}

export interface Devolucion {
  lineas: LineaDevolucion[];
  motivo?: string | null;
  vuelveStock?: boolean | null;
  montoDevuelto?: number | null;
  idVenta: number;
}

export interface ReciboCambio {
  idCambio: number;
  tipo: 'CAMBIO' | 'DEVOLUCION';
  fechaHora: string;
  motivo?: string | null;
  diferencia?: number | null;
  montoDevuelto?: number | null;
  vuelveStock: boolean;
  idVenta?: number | null;
  lineas: Movimiento[];
}

export interface VentaResumen {
  idVenta: number;
  fechaHora: string;
  total: number;
  lineas: Movimiento[];
}

export interface LineaDevolucion {
  idProducto: number;
  cantidad: number;
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
