import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { MensajeResponse } from '../../model/mensaje-response';
import { ReciboVenta } from '../../model/movimiento';
import { Producto } from '../../model/producto';
import { LocalService } from '../../service/local.service';
import { MovimientoService } from '../../service/movimiento.service';
import { ProductoService } from '../../service/producto.service';
import { FechaCortaPipe } from '../../pipes/fecha-corta.pipe';
import { SolesPipe } from '../../pipes/soles.pipe';
import { ToastService } from '../../service/toast.service';
import { COLOR_TODAS, colorCategoria } from '../../tema-tienda';
import { DrawerComponent } from '../drawer/drawer.component';

interface Linea {
  producto: Producto;
  cantidad: number;
  precio: number | null;
}

interface Conteo {
  tipo: string;
  fichas: number;
  unidades: number;
}

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [FormsModule, DrawerComponent, SolesPipe, FechaCortaPipe],
  templateUrl: './venta.component.html',
  styleUrl: './venta.component.css'
})
export class VentaComponent implements OnInit, OnDestroy {
  idLocal = 0;
  nombreLocal = '';
  exigeTalla = false;
  texto = '';
  categorias: string[] = [];
  conteos: Conteo[] = [];
  categoria = '';
  resultados: Producto[] = [];
  limite = 20;
  totalCoinciden = 20;
  lineas: Linea[] = [];
  error = '';
  recibo: ReciboVenta | null = null;
  private rutaSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private localesService: LocalService,
    private productosService: ProductoService,
    private movimientosService: MovimientoService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.rutaSub = this.route.paramMap.subscribe((params: ParamMap) => {
      const nuevo = Number(params.get('idLocal'));
      if (nuevo !== this.idLocal) {
        this.texto = '';
        this.categoria = '';
        this.lineas = [];
        this.recibo = null;
        this.resultados = [];
      }
      this.idLocal = nuevo;
      this.cargarContexto();
      this.buscar();
    });
  }

  ngOnDestroy(): void {
    this.rutaSub?.unsubscribe();
  }

  private cargarContexto(): void {
    this.localesService.listarLocales().subscribe({
      next: (resp: MensajeResponse) => {
        const locales = (resp.object as { idLocal: number; nombre: string; exigeTalla: boolean }[]) ?? [];
        const loc = locales.find(l => l.idLocal === this.idLocal);
        this.nombreLocal = loc?.nombre ?? '';
        this.exigeTalla = loc?.exigeTalla ?? false;
      }
    });
    this.productosService.categorias(this.idLocal).subscribe({
      next: (resp: MensajeResponse) => {
        this.categorias = (resp.object as string[]) ?? [];
      }
    });
    this.productosService.conteoCategorias(this.idLocal).subscribe({
      next: (resp: MensajeResponse) => {
        this.conteos = (resp.object as Conteo[]) ?? [];
      }
    });
  }

  buscar(): void {
    this.error = '';
    this.productosService.buscar(this.idLocal, this.texto.trim(), this.categoria, false, 0, 50).subscribe({
      next: (resp: MensajeResponse) => {
        const r = resp.object as { items: Producto[]; total: number };
        const items = r.items ?? [];
        this.totalCoinciden = r.total ?? 0;
        this.resultados = items;
        this.limite = 20;
      },
      error: () => {
        this.error = 'No se pudo buscar. Revisa la conexión.';
      }
    });
  }

  alBuscar(): void {
    this.buscar();
  }

  elegirCategoria(c: string): void {
    this.categoria = c;
    this.buscar();
  }

  get visibles(): Producto[] {
    return this.resultados.slice(0, this.limite);
  }

  agregar(p: Producto): void {
    const existente = this.lineas.find(l => l.producto.idProducto === p.idProducto);
    if (existente) {
      const stock = p.stock ?? 0;
      existente.cantidad = stock > 0 ? Math.min(existente.cantidad + 1, stock) : existente.cantidad + 1;
      return;
    }
    this.lineas.push({ producto: p, cantidad: 1, precio: p.precioVenta ?? null });
  }

  enCarrito(p: Producto): boolean {
    return this.lineas.some(l => l.producto.idProducto === p.idProducto);
  }

  todas = COLOR_TODAS;

  colorCat(i: number): string {
    return colorCategoria(this.exigeTalla, i);
  }

  quitar(i: number): void {
    this.lineas.splice(i, 1);
  }

  get faltaPrecio(): boolean {
    return this.lineas.some(l => l.producto.precioVenta == null && !(l.precio != null && l.precio >= 0));
  }

  guardando = false;

  confirmar(): void {
    this.error = '';
    if (!this.lineas.length) {
      this.error = 'Agrega productos a la venta.';
      return;
    }
    if (this.faltaPrecio) {
      this.error = 'Falta el precio en una línea: escríbelo antes de confirmar.';
      return;
    }
    if (this.guardando) {
      return;
    }
    this.guardando = true;
    const cuerpo = this.lineas.map(l => ({
      idProducto: l.producto.idProducto!,
      cantidad: l.cantidad,
      precioUnitario: l.producto.precioVenta ?? l.precio
    }));
    this.movimientosService.guardarVenta(cuerpo).subscribe({
      next: (resp: MensajeResponse) => {
        this.guardando = false;
        this.recibo = resp.object as ReciboVenta;
        this.lineas = [];
        this.buscar();
        this.toast.mostrar(`Venta N° ${this.recibo.idVenta} registrada`);
      },
      error: (e) => {
        this.guardando = false;
        const err = e as { error?: MensajeResponse | string };
        this.error = typeof err?.error === 'string' ? err.error : err?.error?.mensaje ?? 'No se pudo guardar la venta.';
      }
    });
  }

  cerrarRecibo(): void {
    this.recibo = null;
  }

  gananciaRecibo(): string {
    if (!this.recibo) {
      return '—';
    }
    if (this.recibo.lineas.some(m => m.precioUnitario == null || m.costoUnitario == null)) {
      return 'faltan costos';
    }
    const g = this.recibo.lineas.reduce((a, m) => a + Number(m.cantidad) * (m.precioUnitario! - m.costoUnitario!), 0);
    return 'S/ ' + g.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
