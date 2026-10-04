import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
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
      error: () => {
        this.cargando = false;
        this.error = 'Usuario o clave incorrectos.';
      }
    });
  }
}
