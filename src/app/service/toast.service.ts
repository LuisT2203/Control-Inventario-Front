import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  mensaje$ = new Subject<string>();

  mostrar(mensaje: string): void {
    this.mensaje$.next(mensaje);
  }
}
