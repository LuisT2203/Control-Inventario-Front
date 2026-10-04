export interface Producto {
  idProducto?: number;
  idLocal?: number;
  codigoLocal?: string;
  nombreLocal?: string;
  codigo: string;
  nombre: string;
  tipo?: string | null;
  talla?: string | null;
  detalle?: string | null;
  unidad?: string;
  stock?: number;
  stockMinimo?: number | null;
  fechaVencimiento?: string | null;
  costoReferencia?: number | null;
  precioVenta?: number | null;
  stockInicial?: number | null;
  activo?: boolean;
  bajoStock?: boolean;
  vencido?: boolean;
}
