import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { MensajeResponse } from '../../model/mensaje-response';
import { ReciboCompra } from '../../model/movimiento';
import { Producto } from '../../model/producto';
import { LocalService } from '../../service/local.service';
import { MovimientoService } from '../../service/movimiento.service';
import { FechaCortaPipe } from '../../pipes/fecha-corta.pipe';
import { SolesPipe } from '../../pipes/soles.pipe';
import { ProductoService } from '../../service/producto.service';
import { ToastService } from '../../service/toast.service';
import { COLOR_TODAS, colorCategoria } from '../../tema-tienda';
import { DrawerComponent } from '../drawer/drawer.component';

interface Linea {
  producto: Producto;
  cantidad: number;
  costo: number | null;
}

interface Conteo {
  tipo: string;
  fichas: number;
  unidades: number;
}

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [FormsModule, DrawerComponent, SolesPipe, FechaCortaPipe],
  templateUrl: './compra.component.html',
  styleUrl: './compra.component.css'
})
export class CompraComponent implements OnInit, OnDestroy {
  idLocal = 0;
  exigeTalla = false;
  texto = '';
  categorias: string[] = [];
  conteos: Conteo[] = [];
  categoria = '';
  resultados: Producto[] = [];
  limite = 20;
  totalCoinciden = 20;
  lineas: Linea[] = [];
  motivo = '';
  error = '';
  recibo: ReciboCompra | null = null;
  nombreLocal = '';
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
        this.motivo = '';
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
      existente.cantidad = existente.cantidad + 1;
      return;
    }
    this.lineas.push({ producto: p, cantidad: 1, costo: p.costoReferencia ?? null });
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

  guardando = false;

  confirmar(): void {
    this.error = '';
    if (!this.lineas.length) {
      this.error = 'Agrega productos a la compra.';
      return;
    }
    if (this.guardando) {
      return;
    }
    this.guardando = true;
    const cuerpo = this.lineas.map(l => ({
      idProducto: l.producto.idProducto!,
      cantidad: l.cantidad,
      costoUnitario: l.costo
    }));
    this.movimientosService.guardarCompra(cuerpo, this.motivo.trim() || undefined).subscribe({
      next: (resp: MensajeResponse) => {
        this.guardando = false;
        this.recibo = resp.object as ReciboCompra;
        this.lineas = [];
        this.motivo = '';
        this.buscar();
        this.toast.mostrar(`Compra N° ${this.recibo.idCompra} registrada`);
      },
      error: (e) => {
        this.guardando = false;
        const err = e as { error?: MensajeResponse | string };
        this.error = typeof err?.error === 'string' ? err.error : err?.error?.mensaje ?? 'No se pudo guardar la compra.';
      }
    });
  }

  cerrarRecibo(): void {
    this.recibo = null;
  }
}
