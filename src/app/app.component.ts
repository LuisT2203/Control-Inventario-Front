import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ToastComponent } from './comp/toast/toast.component';
import { Local } from './model/local';
import { MensajeResponse } from './model/mensaje-response';
import { AuthService } from './service/auth.service';
import { LocalService } from './service/local.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  locales: Local[] = [];
  idLocal = 0;
  modulo = 'inicio';

  constructor(
    public auth: AuthService,
    private router: Router,
    private localesService: LocalService
  ) { }

  ngOnInit(): void {
    this.leerRuta(this.router.url);
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e) => {
      this.leerRuta((e as NavigationEnd).urlAfterRedirects);
    });
    this.cargarLocales();
  }

  get dentro(): boolean {
    return this.auth.isLoggedIn();
  }

  irTienda(id: number): void {
    this.router.navigate(['/' + this.modulo, id]);
  }

  salir(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private leerRuta(url: string): void {
    const partes = url.split('/').filter(p => p);
    if (partes.length >= 2 && this.esModulo(partes[0])) {
      this.modulo = partes[0];
      this.idLocal = Number(partes[1]) || 0;
    } else if (partes.length === 1 && this.esModulo(partes[0])) {
      this.modulo = partes[0];
    }
    if (this.dentro && !this.locales.length) {
      this.cargarLocales();
    }
  }

  private esModulo(m: string): boolean {
    return ['inicio', 'venta', 'compra', 'productos', 'kardex-local'].includes(m);
  }

  private cargarLocales(): void {
    if (!this.dentro) {
      return;
    }
    this.localesService.listarLocales().subscribe({
      next: (resp: MensajeResponse) => {
        this.locales = (resp.object as Local[]) ?? [];
        if (!this.idLocal && this.locales.length) {
          this.idLocal = this.locales[0].idLocal!;
        }
      },
      error: () => undefined
    });
  }
}
