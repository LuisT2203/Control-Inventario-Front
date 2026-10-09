import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { EmblemaComponent } from './comp/emblema/emblema.component';
import { ToastComponent } from './comp/toast/toast.component';
import { Local } from './model/local';
import { MensajeResponse } from './model/mensaje-response';
import { AuthService } from './service/auth.service';
import { LocalService } from './service/local.service';

const TITULOS: Record<string, string> = {
  'inicio': 'Inicio',
  'venta': 'Vender',
  'compra': 'Comprar',
  'cambios': 'Cambios y devoluciones',
  'productos': 'Productos',
  'kardex-local': 'Kardex',
  'kardex': 'Kardex',
  'usuarios': 'Usuarios'
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent, EmblemaComponent],
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

  get tiendaActual(): Local | undefined {
    return this.locales.find(l => l.idLocal === this.idLocal);
  }

  get verCabecera(): boolean {
    return this.dentro && this.idLocal > 0;
  }

  get titulo(): string {
    return TITULOS[this.modulo] ?? 'Kardex';
  }

  get nombreTienda(): string {
    return this.tiendaActual?.nombre ?? '';
  }

  get subTienda(): string {
    const t = this.tiendaActual;
    if (!t) {
      return '';
    }
    return `${t.nombre} · ${t.codigo === 'RELIGIOSOS' ? 'Artículos religiosos' : 'Uniformes escolares'}`;
  }

  irTienda(id: number): void {
    const destino = this.modulo === 'usuarios' ? 'inicio' : this.modulo;
    this.router.navigate(['/' + destino, id]);
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
      if (partes[0] === 'usuarios') {
        this.idLocal = 0;
      }
    }
    if (this.dentro && !this.locales.length) {
      this.cargarLocales();
    }
    this.aplicarTema();
  }

  private esModulo(m: string): boolean {
    return ['inicio', 'venta', 'compra', 'cambios', 'productos', 'kardex-local', 'usuarios'].includes(m);
  }

  private aplicarTema(): void {
    const local = this.locales.find(l => l.idLocal === this.idLocal);
    if (local?.codigo) {
      document.body.dataset['tienda'] = local.codigo;
    } else {
      delete document.body.dataset['tienda'];
    }
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
        this.aplicarTema();
      },
      error: () => undefined
    });
  }
}
