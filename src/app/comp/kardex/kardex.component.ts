import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Kardex } from '../../model/movimiento';
import { MensajeResponse } from '../../model/mensaje-response';
import { MovimientoService } from '../../service/movimiento.service';

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './kardex.component.html',
  styleUrl: './kardex.component.css'
})
export class KardexComponent implements OnInit {
  idProducto = 0;
  kardex?: Kardex;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private movimientosService: MovimientoService
  ) { }

  ngOnInit(): void {
    this.idProducto = Number(this.route.snapshot.paramMap.get('idProducto'));
    this.cargar();
  }

  cargar(): void {
    this.movimientosService.kardex(this.idProducto).subscribe({
      next: (resp: MensajeResponse) => {
        this.kardex = resp.object as Kardex;
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
