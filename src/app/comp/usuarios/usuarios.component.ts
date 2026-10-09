import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../model/usuario';
import { AuthService } from '../../service/auth.service';
import { ToastService } from '../../service/toast.service';
import { UsuarioService } from '../../service/usuario.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  nuevoUsuario = '';
  nuevaClave = '';
  claves: Record<number, string> = {};
  error = '';
  aviso = '';
  guardandoCrear = false;
  procesandoId: number | null = null;
  yo = '';

  constructor(
    private usuariosService: UsuarioService,
    private authService: AuthService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.yo = this.authService.getUsuario() ?? '';
    this.cargar();
  }

  cargar(): void {
    this.error = '';
    this.usuariosService.listar().subscribe({
      next: (lista) => {
        this.usuarios = lista ?? [];
      },
      error: (e) => {
        this.error = this.mensajeError(e);
      }
    });
  }

  crear(): void {
    this.error = '';
    this.aviso = '';
    if (!this.nuevoUsuario.trim() || !this.nuevaClave || this.guardandoCrear) {
      if (!this.nuevoUsuario.trim() || !this.nuevaClave) {
        this.error = 'Escribe usuario y clave (mínimo 10 caracteres).';
      }
      return;
    }
    this.guardandoCrear = true;
    this.usuariosService.crear(this.nuevoUsuario.trim(), this.nuevaClave).subscribe({
      next: (u) => {
        this.guardandoCrear = false;
        this.nuevoUsuario = '';
        this.nuevaClave = '';
        this.aviso = `Usuario ${u.usuario} creado.`;
        this.toast.mostrar(this.aviso);
        this.cargar();
      },
      error: (e) => {
        this.guardandoCrear = false;
        this.error = this.mensajeError(e);
      }
    });
  }

  alternar(u: Usuario): void {
    this.error = '';
    if (!u.id || this.procesandoId !== null) {
      return;
    }
    this.procesandoId = u.id;
    this.usuariosService.cambiarEstado(u.id, !u.estado).subscribe({
      next: (act) => {
        this.procesandoId = null;
        this.toast.mostrar(act.estado ? `${act.usuario} activado` : `${act.usuario} desactivado`);
        this.cargar();
      },
      error: (e) => {
        this.procesandoId = null;
        this.error = this.mensajeError(e);
      }
    });
  }

  cambiarClave(u: Usuario): void {
    this.error = '';
    const clave = (this.claves[u.id!] ?? '').trim();
    if (!u.id || !clave || this.procesandoId !== null) {
      if (!clave) {
        this.error = 'Escribe la nueva clave (mínimo 10 caracteres).';
      }
      return;
    }
    this.procesandoId = u.id;
    this.usuariosService.cambiarClave(u.id, clave).subscribe({
      next: (act) => {
        this.procesandoId = null;
        this.claves[act.id!] = '';
        this.aviso = `Clave de ${act.usuario} actualizada.`;
        this.toast.mostrar(this.aviso);
      },
      error: (e) => {
        this.procesandoId = null;
        this.error = this.mensajeError(e);
      }
    });
  }

  esYo(u: Usuario): boolean {
    return !!this.yo && u.usuario.toLowerCase() === this.yo.toLowerCase();
  }

  private mensajeError(e: unknown): string {
    const err = e as { error?: { mensaje?: string } | string };
    if (typeof err?.error === 'string') {
      return err.error;
    }
    return err?.error?.mensaje ?? 'Algo falló. Prueba de nuevo.';
  }
}
