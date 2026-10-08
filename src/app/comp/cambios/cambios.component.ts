import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FechaCortaPipe } from '../../pipes/fecha-corta.pipe';
import { SolesPipe } from '../../pipes/soles.pipe';
import { LineaDevolucion, Movimiento, ReciboCambio, VentaResumen } from '../../model/movimiento';
import { MensajeResponse } from '../../model/mensaje-response';
import { Producto } from '../../model/producto';
import { LocalService } from '../../service/local.service';
import { MovimientoService } from '../../service/movimiento.service';
import { ProductoService } from '../../service/producto.service';
import { ToastService } from '../../service/toast.service';
import { DrawerComponent } from '../drawer/drawer.component';

const MOTIVOS_DEV = ['No le quedó la talla', 'Falla de fábrica', 'Se equivocó de producto', 'Otro'];

interface DevSel {
  idProducto: number;
  codigo?: string;
  nombre?: string;
  talla?: string | null;
  precio?: number | null;
  compradas: number;
  marca: boolean;
  cantidad: number;
}

@Component({
  selector: 'app-cambios',
  standalone: true,
  imports: [FormsModule, FechaCortaPipe, SolesPipe, DrawerComponent],
  templateUrl: './cambios.component.html',
  styleUrl: './cambios.component.css'
})
export class CambiosComponent implements OnInit {
  idLocal = 0;
  exigeTalla = false;
  productos: Producto[] = [];
  porId = new Map<number, Producto>();
  ventas: VentaResumen[] = [];
  ventaSel: VentaResumen | null = null;
  busVenta = '';
  vista: 'menu' | 'cambio' | 'dev' = 'menu';
  paso = 0;
  texto = '';
  entraId = 0;
  saleId = 0;
  cantEntra = 1;
  cantSale = 1;
  error = '';
  ultimoTexto = '';
  devLineas: DevSel[] = [];
  devMotivo = MOTIVOS_DEV[0];
  devStock = true;
  devMonto: number | null = null;
  errorDev = '';
  motivos = MOTIVOS_DEV;
  historial: ReciboCambio[] = [];
  recibo: ReciboCambio | null = null;

  constructor(
    private route: ActivatedRoute,
    private productosService: ProductoService,
    private movimientosService: MovimientoService,
    private localesService: LocalService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(p => {
      this.idLocal = Number(p.get('idLocal')) || 0;
      this.volverMenu();
      this.cargar();
    });
  }

  volverMenu(): void {
    this.vista = 'menu';
    this.paso = 0;
    this.texto = '';
    this.busVenta = '';
    this.ventaSel = null;
    this.entraId = 0;
    this.saleId = 0;
    this.cantEntra = 1;
    this.cantSale = 1;
    this.error = '';
    this.ultimoTexto = '';
    this.devLineas = [];
    this.devMotivo = MOTIVOS_DEV[0];
    this.devStock = true;
    this.devMonto = null;
    this.errorDev = '';
    this.recibo = null;
  }

  irCambio(): void {
    this.volverMenu();
    this.vista = 'cambio';
    this.paso = 0;
  }

  irDev(): void {
    this.volverMenu();
    this.vista = 'dev';
    this.paso = 0;
  }

  ventasFiltradas(): VentaResumen[] {
    const t = this.busVenta.trim();
    const lista = t ? this.ventas.filter(v => String(v.idVenta).includes(t)) : this.ventas;
    return lista.slice(0, 20);
  }

  elegirVenta(v: VentaResumen): void {
    this.ventaSel = v;
    this.entraId = 0;
    this.saleId = 0;
    this.cantEntra = 1;
    this.cantSale = 1;
    this.devLineas = (v.lineas ?? []).map(l => ({
      idProducto: l.idProducto,
      codigo: l.codigoProducto,
      nombre: l.nombreProducto,
      talla: l.tallaProducto,
      precio: l.precioUnitario,
      compradas: l.cantidad,
      marca: false,
      cantidad: l.cantidad
    }));
    this.devMonto = null;
    this.paso = 1;
  }

  get entra(): Producto | undefined {
    return this.porId.get(this.entraId);
  }

  get sale(): Producto | undefined {
    return this.porId.get(this.saleId);
  }

  lineasVenta(): Movimiento[] {
    return this.ventaSel?.lineas ?? [];
  }

  filtrados(): Producto[] {
    const t = this.texto.trim().toLowerCase();
    const lista = t
      ? this.productos.filter(p => `${p.codigo} ${p.nombre} ${p.talla ?? ''}`.toLowerCase().includes(t))
      : this.productos;
    return lista.slice(0, 30);
  }

  otrasTallas(): Producto[] {
    const base = this.entra;
    if (!this.exigeTalla || !base?.tipo) {
      return [];
    }
    return this.productos.filter(p => p.tipo === base.tipo && p.idProducto !== base.idProducto);
  }

  elegirEntra(id: number): void {
    this.entraId = id;
    const linea = this.lineasVenta().find(l => l.idProducto === id);
    this.cantEntra = linea?.cantidad ?? 1;
    this.paso = 2;
    this.texto = '';
  }

  elegirSale(id: number): void {
    this.saleId = id;
    this.paso = 3;
  }

  lineasTexto(v: VentaResumen): string {
    return (v.lineas ?? [])
      .map(l => `${l.codigoProducto} ${l.nombreProducto ?? ''} ${l.tallaProducto ?? ''}`.trim().replace(/\s+/g, ' ') + ` x${l.cantidad}`)
      .join(' · ');
  }

  alMarcar(): void {
    for (const l of this.devLineas) {
      if (l.cantidad > 0 && !l.marca) {
        l.marca = true;
      }
    }
  }

  montoAuto(): number {
    return this.devLineas
      .filter(l => l.marca)
      .reduce((a, l) => a + (l.precio ?? 0) * l.cantidad, 0);
  }

  textoDiferencia(): string {
    const a = this.entra;
    const b = this.sale;
    if (!a || !b) {
      return '';
    }
    if (a.precioVenta == null || b.precioVenta == null) {
      const cual = a.precioVenta == null ? this.etiqueta(a) : this.etiqueta(b);
      return `Falta el precio de ${cual}`;
    }
    const d = b.precioVenta * this.cantSale - a.precioVenta * this.cantEntra;
    if (d === 0) {
      return 'Sin diferencia';
    }
    return d > 0 ? `El cliente paga S/ ${d.toFixed(2)}` : `Se devuelven S/ ${(-d).toFixed(2)} al cliente`;
  }

  guardandoCambio = false;
  guardandoDev = false;

  guardarCambio(): void {
    this.error = '';
    const a = this.entra;
    const b = this.sale;
    if (!this.ventaSel) {
      this.error = 'Elige primero la venta de origen.';
      return;
    }
    if (!a || !b) {
      this.error = 'Elige la ficha que vuelve y la que se lleva.';
      return;
    }
    if (!(this.cantEntra > 0) || !(this.cantSale > 0)) {
      this.error = 'Escribe cantidades mayores que 0.';
      return;
    }
    if (a.precioVenta == null || b.precioVenta == null) {
      this.error = 'Falta el precio de una de las fichas: ponlo en Productos primero.';
      return;
    }
    if (this.cantSale > (b.stock ?? 0)) {
      this.error = `Solo quedan ${b.stock} de ${this.etiqueta(b)}.`;
      return;
    }
    if (this.guardandoCambio) {
      return;
    }
    this.guardandoCambio = true;
    this.movimientosService.guardarCambio({
      idProductoEntra: a.idProducto!,
      cantidadEntra: this.cantEntra,
      idProductoSale: b.idProducto!,
      cantidadSale: this.cantSale,
      precioUnitario: b.precioVenta,
      idVenta: this.ventaSel.idVenta
    }).subscribe({
      next: (resp: MensajeResponse) => {
        this.guardandoCambio = false;
        const r = resp.object as ReciboCambio;
        this.ultimoTexto = `Cambio N° ${r.idCambio} guardado. ${this.textoDiferencia()}`;
        this.toast.mostrar(`Cambio N° ${r.idCambio} guardado`);
        this.abrirRecibo(r.idCambio);
        this.cargar();
      },
      error: (e) => {
        this.guardandoCambio = false;
        this.error = this.mensajeError(e);
      }
    });
  }

  motivoCambiado(): void {
    this.devStock = this.devMotivo !== 'Falla de fábrica';
  }

  guardarDevolucion(): void {
    this.errorDev = '';
    if (!this.ventaSel) {
      this.errorDev = 'Elige primero la venta de origen.';
      return;
    }
    const elegidas: LineaDevolucion[] = this.devLineas
      .filter(l => l.marca)
      .map(l => ({ idProducto: l.idProducto, cantidad: l.cantidad }));
    if (!elegidas.length) {
      this.errorDev = 'Marca al menos una prenda que vuelve.';
      return;
    }
    if (elegidas.some(l => !(l.cantidad > 0))) {
      this.errorDev = 'Escribe cantidades mayores que 0.';
      return;
    }
    if (this.guardandoDev) {
      return;
    }
    this.guardandoDev = true;
    this.movimientosService.guardarDevolucion({
      lineas: elegidas,
      motivo: this.devMotivo,
      vuelveStock: this.devStock,
      montoDevuelto: this.devMonto ?? this.montoAuto(),
      idVenta: this.ventaSel.idVenta
    }).subscribe({
      next: (resp: MensajeResponse) => {
        this.guardandoDev = false;
        const r = resp.object as ReciboCambio;
        this.toast.mostrar(`Devolución N° ${r.idCambio} guardada`);
        this.volverMenu();
        this.cargar();
      },
      error: (e) => {
        this.guardandoDev = false;
        this.errorDev = this.mensajeError(e);
      }
    });
  }

  abrirRecibo(id: number): void {
    this.movimientosService.verCambio(id).subscribe({
      next: (r) => {
        this.recibo = r;
      },
      error: (e) => {
        this.toast.mostrar(this.mensajeError(e));
      }
    });
  }

  etiqueta(p: Producto): string {
    return `${p.nombre}${p.talla ? ' ' + p.talla : ''}`;
  }

  mensajeError(e: unknown): string {
    const ehttp = e as { error?: { mensaje?: string } | string };
    if (typeof ehttp?.error === 'string') {
      return ehttp.error;
    }
    return ehttp?.error?.mensaje || 'No se pudo guardar. Revisa la conexión.';
  }

  private cargar(): void {
    if (!this.idLocal) {
      return;
    }
    this.localesService.listarLocales().subscribe({
      next: (resp: MensajeResponse) => {
        const locales = (resp.object as { idLocal: number; exigeTalla: boolean }[]) ?? [];
        this.exigeTalla = locales.find(l => l.idLocal === this.idLocal)?.exigeTalla ?? false;
      },
      error: () => undefined
    });
    this.productosService.listarProductos(this.idLocal).subscribe({
      next: (resp: MensajeResponse) => {
        this.productos = (resp.object as Producto[]) ?? [];
        this.porId = new Map(this.productos.map(p => [p.idProducto!, p]));
      },
      error: () => undefined
    });
    this.movimientosService.listarVentas(this.idLocal, 30).subscribe({
      next: (resp: MensajeResponse) => {
        this.ventas = (resp.object as VentaResumen[]) ?? [];
      },
      error: () => undefined
    });
    this.movimientosService.listarCambios(this.idLocal, 30).subscribe({
      next: (resp: MensajeResponse) => {
        this.historial = (resp.object as ReciboCambio[]) ?? [];
      },
      error: () => undefined
    });
  }
}
