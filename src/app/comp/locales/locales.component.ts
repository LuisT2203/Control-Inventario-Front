import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmblemaComponent } from '../emblema/emblema.component';
import { FondoEstrellasComponent } from '../fondo-estrellas/fondo-estrellas.component';
import { Local } from '../../model/local';
import { AuthService } from '../../service/auth.service';
import { LocalService } from '../../service/local.service';
import { MensajeResponse } from '../../model/mensaje-response';

@Component({
  selector: 'app-locales',
  standalone: true,
  imports: [RouterLink, EmblemaComponent, FondoEstrellasComponent],
  templateUrl: './locales.component.html',
  styleUrl: './locales.component.css'
})
export class LocalesComponent implements OnInit {
  locales: Local[] = [];
  error = '';
  usuario: string | null = null;

  constructor(private localesService: LocalService, private auth: AuthService) { }

  fondo(local: Local): string {
    return local.codigo === 'RELIGIOSOS' ? '#DCE8FF' : '#D6F2E2';
  }

  arte(local: Local): string {
    return local.codigo === 'RELIGIOSOS' ? '#C7DAFF' : '#BFE8D1';
  }

  ngOnInit(): void {
    this.usuario = this.auth.getUsuario();
    this.localesService.listarLocales().subscribe({
      next: (resp: MensajeResponse) => {
        this.locales = (resp.object as Local[]) ?? [];
      },
      error: () => {
        this.error = 'No se pudieron cargar los locales. Revisa que la API esté en 8081.';
      }
    });
  }
}
