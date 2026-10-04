import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Local } from '../../model/local';
import { LocalService } from '../../service/local.service';
import { MensajeResponse } from '../../model/mensaje-response';

@Component({
  selector: 'app-locales',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './locales.component.html',
  styleUrl: './locales.component.css'
})
export class LocalesComponent implements OnInit {
  locales: Local[] = [];
  error = '';

  constructor(private localesService: LocalService) { }

  ngOnInit(): void {
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
