import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { MensajeResponse } from '../../model/mensaje-response';
import { Movimiento, ReciboCompra, ReciboVenta } from '../../model/movimiento';
import { FechaCortaPipe } from '../../pipes/fecha-corta.pipe';
import { LocalService } from '../../service/local.service';
import { MovimientoService } from '../../service/movimiento.service';
import { SolesPipe } from '../../pipes/soles.pipe';
import { DrawerComponent } from '../drawer/drawer.component';

@Component({
  selector: 'app-kardex-local',
  standalone: true,
  imports: [FormsModule, RouterLink, DrawerComponent, SolesPipe, FechaCortaPipe],
  templateUrl: './kardex-local.component.html',
  styleUrl: './kardex-local.component.css'
})
export class KardexLocalComponent implements OnInit, OnDestroy {
  idLocal = 0;
  dias = 1;
  texto = '';
  movimientos: Movimiento[] = [];
  limite = 30;
  error = '';
  mov: Movimiento | null = null;
  reciboVenta: ReciboVenta | null = null;
  reciboCompra: ReciboCompra | null = null;
  nombreLocal = '';
  private rutaSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localesService: LocalService,
    private movimientosService: MovimientoService
  ) { }

  ngOnInit(): void {
    this.rutaSub = this.route.paramMap.subscribe((params: ParamMap) => {
      const nuevo = Number(params.get('idLocal'));
      if (nuevo !== this.idLocal) {
        this.texto = '';
        this.dias = 1;
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
      next: (resp) => {
        const locales = (resp.object as { idLocal: number; nombre: string }[]) ?? [];
        this.nombreLocal = locales.find(l => l.idLocal === this.idLocal)?.nombre ?? '';
      }
    });
  }

  ganancia(lineas: Movimiento[]): string {
    if (lineas.some(m => m.precioUnitario == null || m.costoUnitario == null)) {
      return 'faltan costos';
    }
    const g = lineas.reduce((a, m) => a + Number(m.cantidad) * (m.precioUnitario! - m.costoUnitario!), 0);
    return 'S/ ' + g.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  cargar(): void {
    this.error = '';
    this.mov = null;
    this.reciboVenta = null;
    this.reciboCompra = null;
    this.movimientosService.recientes(this.idLocal, this.dias).subscribe({
      next: (resp: MensajeResponse) => {
        this.movimientos = (resp.object as Movimiento[]) ?? [];
        this.limite = 30;
      },
      error: () => {
        this.error = 'No se pudo cargar el kardex. Revisa la conexión.';
      }
    });
  }

  get filtrados(): Movimiento[] {
    const t = this.texto.trim().toLowerCase();
    if (!t) {
      return this.movimientos;
    }
    return this.movimientos.filter(m =>
      (m.codigoProducto ?? '').toLowerCase().includes(t) ||
      (m.nombreProducto ?? '').toLowerCase().includes(t) ||
      (m.motivo ?? '').toLowerCase().includes(t));
  }

  get visibles(): Movimiento[] {
    return this.filtrados.slice(0, this.limite);
  }

  abrir(m: Movimiento): void {
    this.reciboVenta = null;
    this.reciboCompra = null;
    if (m.idVenta != null) {
      this.movimientosService.verVenta(m.idVenta).subscribe({
        next: (r) => {
          this.mov = null;
          this.reciboVenta = r;
        }
      });
    } else if (m.idCompra != null) {
      this.movimientosService.verCompra(m.idCompra).subscribe({
        next: (r) => {
          this.mov = null;
          this.reciboCompra = r;
        }
      });
    } else {
      this.mov = m;
    }
  }

  cerrarTodo(): void {
    this.mov = null;
    this.reciboVenta = null;
    this.reciboCompra = null;
  }

  verFicha(): void {
    const id = this.mov?.idProducto;
    this.cerrarTodo();
    if (id) {
      this.router.navigate(['/kardex', id]);
    }
  }
}
