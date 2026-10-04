import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { MensajeResponse } from '../../model/mensaje-response';
import { Movimiento } from '../../model/movimiento';
import { Producto } from '../../model/producto';
import { LocalService } from '../../service/local.service';
import { MovimientoService } from '../../service/movimiento.service';
import { ProductoService } from '../../service/producto.service';
import { SolesPipe } from '../../pipes/soles.pipe';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, SolesPipe],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit, OnDestroy {
  idLocal = 0;
  nombreLocal = '';
  ventasHoy = 0;
  totalHoy = 0;
  faltantes: Producto[] = [];
  totalFaltantes = 0;
  error = '';
  private rutaSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private localesService: LocalService,
    private movimientosService: MovimientoService,
    private productosService: ProductoService
  ) { }

  ngOnInit(): void {
    this.rutaSub = this.route.paramMap.subscribe((params: ParamMap) => {
      this.idLocal = Number(params.get('idLocal'));
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
        const locales = (resp.object as { idLocal: number; nombre: string }[]) ?? [];
        this.nombreLocal = locales.find(l => l.idLocal === this.idLocal)?.nombre ?? '';
      }
    });
  }

  private cargar(): void {
    this.movimientosService.recientes(this.idLocal, 1).subscribe({
      next: (resp: MensajeResponse) => {
        const movs = (resp.object as Movimiento[]) ?? [];
        const ventas = movs.filter(m => m.tipo === 'SALIDA' && m.idVenta != null);
        const grupos = new Set(ventas.map(m => m.idVenta));
        this.ventasHoy = grupos.size;
        this.totalHoy = ventas.reduce((acc, m) => acc + (m.precioUnitario ?? 0) * Number(m.cantidad), 0);
      },
      error: () => {
        this.error = 'No se pudieron cargar las ventas de hoy.';
      }
    });
    this.productosService.buscar(this.idLocal, '', '', true, 0, 10).subscribe({
      next: (resp: MensajeResponse) => {
        const r = resp.object as { items: Producto[]; total: number };
        this.faltantes = r.items ?? [];
        this.totalFaltantes = r.total ?? 0;
      }
    });
  }
}
