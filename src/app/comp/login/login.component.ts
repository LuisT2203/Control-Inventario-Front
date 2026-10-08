import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { FondoEstrellasComponent } from '../fondo-estrellas/fondo-estrellas.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, FondoEstrellasComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  usuario = '';
  clave = '';
  error = '';
  cargando = false;

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/locales']);
    }
  }

  entrar(): void {
    this.error = '';
    if (!this.usuario.trim() || !this.clave) {
      this.error = 'Escribe usuario y clave.';
      return;
    }
    this.cargando = true;
    this.auth.login(this.usuario.trim(), this.clave).subscribe({
      next: () => this.router.navigate(['/locales']),
      error: (e: { status?: number }) => {
        this.cargando = false;
        this.error = e?.status === 0
          ? 'No se pudo conectar con el servidor. Revisa que la API esté encendida y en la misma red WiFi.'
          : 'Usuario o clave incorrectos.';
      }
    });
  }
}
