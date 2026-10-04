import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { MensajeResponse } from '../../model/mensaje-response';
import { Kardex, Movimiento, ReciboCompra, ReciboVenta } from '../../model/movimiento';
import { Producto } from '../../model/producto';
import { LocalService } from '../../service/local.service';
import { FechaCortaPipe } from '../../pipes/fecha-corta.pipe';
import { MovimientoService } from '../../service/movimiento.service';
import { ProductoService } from '../../service/producto.service';
import { ToastService } from '../../service/toast.service';
import { SolesPipe } from '../../pipes/soles.pipe';
import { DrawerComponent } from '../drawer/drawer.component';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule, RouterLink, DrawerComponent, SolesPipe, FechaCortaPipe],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit, OnDestroy {
  idLocal = 0;
  nombreLocal = '';
  exigeTalla = false;
  productos: Producto[] = [];
  categorias: string[] = [];
  texto = '';
  categoria = '';
  conteos: { tipo: string; fichas: number; unidades: number; sinStock: number }[] = [];
  soloSinStock = false;
  soloSinPrecio = false;
  vista: 'precios' | 'costos' = 'precios';
  todo: Producto[] = [];
  limite = 30;
  totalCoinciden = 0;
  error = '';
  aviso = '';
  mostrandoFormulario = false;
  editandoId: number | null = null;
  form: Producto = { codigo: '', nombre: '' };
  ficha: { producto: Producto; movimientos: Movimiento[] } | null = null;
  prenda: { id: number; codigo: string; nombre: string; talla: string | null; stock?: number; precio: number | null; costo: number | null }[] | null = null;
  mismoPrecio: number | null = null;
  mismoCosto: number | null = null;
  errorPrenda = '';
  avisoPrenda = '';
  reciboVenta: ReciboVenta | null = null;
  reciboCompra: ReciboCompra | null = null;
  nuevoPrecio: number | null = null;
  nuevoCosto: number | null = null;
  errorPrecio = '';
  avisoPrecio = '';
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
        this.soloSinStock = false;
        this.soloSinPrecio = false;
        this.ficha = null;
        this.prenda = null;
        this.mostrandoFormulario = false;
      }
      this.idLocal = nuevo;
      this.cargarContexto();
      this.cargar();
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
        this.conteos = (resp.object as { tipo: string; fichas: number; unidades: number; sinStock: number }[]) ?? [];
      }
    });
  }

  cargar(): void {
    this.error = '';
    this.productosService.buscar(this.idLocal, this.texto.trim(), this.categoria, this.soloSinStock, 0, 200, this.soloSinPrecio).subscribe({
      next: (resp: MensajeResponse) => {
        const r = resp.object as { items: Producto[]; total: number };
        this.productos = r.items ?? [];
        this.totalCoinciden = r.total ?? 0;
        this.limite = 30;
      },
      error: (e) => {
        this.error = this.mensajeError(e);
      }
    });
  }

  alBuscar(): void {
    this.cargar();
  }

  cambiarVista(v: 'precios' | 'costos'): void {
    this.vista = v;
    if (v === 'costos') {
      this.cargarTodo();
    }
  }

  cargarTodo(): void {
    this.todo = [];
    const tamano = 50;
    const pedir = (pagina: number) => {
      this.productosService.buscar(this.idLocal, this.texto.trim(), this.categoria, this.soloSinStock, pagina, tamano, this.soloSinPrecio).subscribe({
        next: (resp: MensajeResponse) => {
          const r = resp.object as { items: Producto[]; total: number };
          this.todo = this.todo.concat(r.items ?? []);
          if (this.todo.length < (r.total ?? 0)) {
            pedir(pagina + 1);
          }
        },
        error: (e) => {
          this.error = this.mensajeError(e);
        }
      });
    };
    pedir(0);
  }

  get baseCostos(): Producto[] {
    const t = this.todo.length ? this.todo : this.productos;
    if (this.soloSinPrecio) {
      return t.filter(p => p.precioVenta == null);
    }
    return t;
  }

  costoTotal(p: Producto): number | null {
    if (p.stock == null || p.costoReferencia == null) {
      return null;
    }
    return Number(p.stock) * p.costoReferencia;
  }

  valorStock(p: Producto): number | null {
    if (p.stock == null || p.precioVenta == null) {
      return null;
    }
    return Number(p.stock) * p.precioVenta;
  }

  ganancia(p: Producto): number | null {
    if (p.precioVenta == null || p.costoReferencia == null) {
      return null;
    }
    return p.precioVenta - p.costoReferencia;
  }

  pctCosto(p: Producto): number | null {
    const g = this.ganancia(p);
    if (g == null || !p.costoReferencia) {
      return null;
    }
    return Math.round(g / p.costoReferencia * 100);
  }

  get sumaCostoTotal(): number {
    return this.baseCostos.reduce((a, p) => a + (this.costoTotal(p) ?? 0), 0);
  }

  get sumaValorStock(): number {
    return this.baseCostos.reduce((a, p) => a + (this.valorStock(p) ?? 0), 0);
  }

  get sumaGanancia(): number {
    return this.baseCostos.reduce((a, p) => a + (this.ganancia(p) ?? 0), 0);
  }

  get fueraCosto(): number {
    return this.baseCostos.filter(p => p.stock == null || p.costoReferencia == null).length;
  }

  get fueraPrecio(): number {
    return this.baseCostos.filter(p => p.stock == null || p.precioVenta == null).length;
  }

  get fueraGanancia(): number {
    return this.baseCostos.filter(p => this.ganancia(p) == null).length;
  }

  elegirCategoria(c: string): void {
    this.categoria = c;
    this.cargar();
  }

  alternarSinStock(): void {
    this.soloSinStock = !this.soloSinStock;
    this.cargar();
  }

  alternarSinPrecio(): void {
    this.soloSinPrecio = !this.soloSinPrecio;
    this.cargar();
    if (this.vista === 'costos') {
      this.cargarTodo();
    }
  }

  get visibles(): Producto[] {
    return this.productos.slice(0, this.limite);
  }

  abrirFicha(p: Producto): void {
    this.reciboVenta = null;
    this.reciboCompra = null;
    this.movimientosService.kardex(p.idProducto!).subscribe({
      next: (resp: MensajeResponse) => {
        const k = resp.object as Kardex;
        this.ficha = { producto: k.producto, movimientos: (k.movimientos ?? []).slice(-20).reverse() };
        this.nuevoPrecio = k.producto.precioVenta ?? null;
        this.nuevoCosto = k.producto.costoReferencia ?? null;
        this.errorPrecio = '';
        this.avisoPrecio = '';
      },
      error: (e) => {
        this.error = this.mensajeError(e);
      }
    });
  }

  cerrarFicha(): void {
    this.ficha = null;
  }

  gananciaLineas(lineas: Movimiento[]): string {
    if (lineas.some(m => m.precioUnitario == null || m.costoUnitario == null)) {
      return 'faltan costos';
    }
    const g = lineas.reduce((a, m) => a + Number(m.cantidad) * (m.precioUnitario! - m.costoUnitario!), 0);
    return 'S/ ' + g.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  abrirDoc(m: Movimiento): void {
    if (m.idVenta != null) {
      this.movimientosService.verVenta(m.idVenta).subscribe({
        next: (r) => {
          this.reciboVenta = r;
        }
      });
    } else if (m.idCompra != null) {
      this.movimientosService.verCompra(m.idCompra).subscribe({
        next: (r) => {
          this.reciboCompra = r;
        }
      });
    }
  }

  get gananciaPrevia(): { texto: string; mala: boolean } {
    if (this.nuevoPrecio == null || this.nuevoCosto == null) {
      return { texto: 'falta el precio o el costo', mala: false };
    }
    const g = this.nuevoPrecio - this.nuevoCosto;
    const pct = this.nuevoCosto > 0 ? ` (${Math.round(g / this.nuevoCosto * 100)}% s/ costo)` : '';
    return { texto: `S/ ${g.toFixed(2)}${pct}`, mala: g < 0 };
  }

  guardarPrecioCosto(): void {
    this.errorPrecio = '';
    this.avisoPrecio = '';
    if (!this.ficha?.producto.idProducto) {
      return;
    }
    const id = this.ficha.producto.idProducto;
    this.productosService.actualizarPrecioCosto(id, this.nuevoPrecio, this.nuevoCosto).subscribe({
      next: () => {
        this.cargar();
        this.abrirFicha({ idProducto: id } as Producto);
        this.toast.mostrar('Guardado');
      },
      error: (e) => {
        this.errorPrecio = this.mensajeError(e);
      }
    });
  }

  abrirPreciosPrenda(): void {
    if (!this.categoria) {
      return;
    }
    this.errorPrenda = '';
    this.avisoPrenda = '';
    this.mismoPrecio = null;
    this.mismoCosto = null;
    this.productosService.buscar(this.idLocal, '', this.categoria, false, 0, 50).subscribe({
      next: (resp: MensajeResponse) => {
        const r = resp.object as { items: Producto[] };
        this.prenda = (r.items ?? []).map(p => ({
          id: p.idProducto!,
          codigo: p.codigo,
          nombre: p.nombre,
          talla: p.talla ?? null,
          stock: p.stock,
          precio: p.precioVenta ?? null,
          costo: p.costoReferencia ?? null
        }));
      },
      error: (e) => {
        this.error = this.mensajeError(e);
      }
    });
  }

  cerrarPrenda(): void {
    this.prenda = null;
  }

  aplicarATodas(): void {
    if (!this.prenda) {
      return;
    }
    for (const t of this.prenda) {
      if (this.mismoPrecio != null) {
        t.precio = this.mismoPrecio;
      }
      if (this.mismoCosto != null) {
        t.costo = this.mismoCosto;
      }
    }
  }

  guardarPrenda(): void {
    this.errorPrenda = '';
    this.avisoPrenda = '';
    if (!this.prenda) {
      return;
    }
    const lineas = this.prenda
      .filter(t => t.precio != null || t.costo != null)
      .map(t => ({ idProducto: t.id, precioVenta: t.precio, costoReferencia: t.costo }));
    if (!lineas.length) {
      this.errorPrenda = 'No hay precios que guardar.';
      return;
    }
    this.productosService.actualizarPreciosCostos(lineas).subscribe({
      next: () => {
        const bajos = this.prenda!.filter(t => t.precio != null && t.costo != null && t.precio < t.costo).length;
        this.cerrarPrenda();
        this.cargar();
        this.toast.mostrar(bajos ? `Precios guardados. Ojo: ${bajos} con precio menor que el costo.` : 'Precios guardados');
      },
      error: (e) => {
        this.errorPrenda = this.mensajeError(e);
      }
    });
  }

  nuevaFicha(): void {
    this.editandoId = null;
    this.form = { codigo: '', nombre: '', unidad: 'UND', activo: true };
    this.mostrandoFormulario = true;
    this.aviso = '';
  }

  editarDesdeFicha(): void {
    if (!this.ficha) {
      return;
    }
    const p = this.ficha.producto;
    this.productosService.getProducto(p.idProducto!).subscribe({
      next: (llena) => {
        this.editandoId = llena.idProducto ?? null;
        this.form = { ...llena, stockInicial: null };
        this.mostrandoFormulario = true;
        this.ficha = null;
      },
      error: (e) => {
        this.error = this.mensajeError(e);
      }
    });
  }

  guardar(): void {
    this.error = '';
    this.form.idLocal = this.idLocal;
    const llamada = this.editandoId
      ? this.productosService.actualizar({ ...this.form, idProducto: this.editandoId })
      : this.productosService.guardar(this.form);
    llamada.subscribe({
      next: (resp) => {
        this.aviso = resp.mensaje;
        this.mostrandoFormulario = false;
        this.cargar();
      },
      error: (e) => {
        this.error = this.mensajeError(e);
      }
    });
  }

  eliminarDesdeFicha(): void {
    if (!this.ficha?.producto.idProducto) {
      return;
    }
    const codigo = this.ficha.producto.codigo;
    if (!confirm(`¿Eliminar ${codigo}? No se puede si ya tiene movimientos.`)) {
      return;
    }
    const id = this.ficha.producto.idProducto;
    this.productosService.eliminar(id).subscribe({
      next: (resp) => {
        this.aviso = resp.mensaje;
        this.ficha = null;
        this.cargar();
      },
      error: (e) => {
        this.error = this.mensajeError(e);
      }
    });
  }

  private mensajeError(e: unknown): string {
    const err = e as { error?: MensajeResponse | string };
    if (typeof err?.error === 'string') {
      return err.error;
    }
    return err?.error?.mensaje ?? 'Algo falló. Prueba de nuevo.';
  }
}
