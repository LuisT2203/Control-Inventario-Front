import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Kardex, Movimiento } from '../../model/movimiento';
import { MensajeResponse } from '../../model/mensaje-response';
import { Producto } from '../../model/producto';
import { MovimientoService } from '../../service/movimiento.service';
import { ProductoService } from '../../service/producto.service';

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './kardex.component.html',
  styleUrl: './kardex.component.css'
})
export class KardexComponent implements OnInit {
  idProducto = 0;
  kardex?: Kardex;
  error = '';
  aviso = '';
  mov: Movimiento = { idProducto: 0, tipo: 'SALIDA', cantidad: 1 };
  otros: Producto[] = [];
  cambio = { idProductoEntra: 0, cantidadEntra: 1, idProductoSale: 0, cantidadSale: 1, personaRetira: '', destino: '' };

  constructor(
    private route: ActivatedRoute,
    private movimientosService: MovimientoService,
    private productosService: ProductoService
  ) { }

  ngOnInit(): void {
    this.idProducto = Number(this.route.snapshot.paramMap.get('idProducto'));
    this.mov.idProducto = this.idProducto;
    this.cambio.idProductoSale = this.idProducto;
    this.cambio.idProductoEntra = this.idProducto;
    this.cargar();
  }

  cargar(): void {
    this.movimientosService.kardex(this.idProducto).subscribe({
      next: (resp: MensajeResponse) => {
        this.kardex = resp.object as Kardex;
        const idLocal = this.kardex.producto.idLocal;
        if (idLocal) {
          this.productosService.listarProductos(idLocal, false).subscribe({
            next: (r) => {
              this.otros = (r.object as Producto[]) ?? [];
            }
          });
        }
      },
      error: (e) => {
        this.error = this.mensajeError(e);
      }
    });
  }

  guardarMovimiento(): void {
    this.error = '';
    this.aviso = '';
    this.movimientosService.guardar({ ...this.mov, idProducto: this.idProducto }).subscribe({
      next: (resp) => {
        this.aviso = resp.mensaje;
        this.mov = { idProducto: this.idProducto, tipo: 'SALIDA', cantidad: 1 };
        this.cargar();
      },
      error: (e) => {
        this.error = this.mensajeError(e);
      }
    });
  }

  guardarCambio(): void {
    this.error = '';
    this.aviso = '';
    this.movimientosService.guardarCambio(this.cambio).subscribe({
      next: (resp) => {
        this.aviso = resp.mensaje + ' (dos líneas)';
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
