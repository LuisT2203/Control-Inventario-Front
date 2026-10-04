import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaCorta',
  standalone: true
})
export class FechaCortaPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    if (!valor) {
      return '—';
    }
    const fecha = new Date(valor.replace(' ', 'T'));
    if (isNaN(fecha.getTime())) {
      return valor;
    }
    return fecha.toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  }
}
