import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'soles',
  standalone: true
})
export class SolesPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    if (valor == null) {
      return '—';
    }
    return 'S/ ' + Number(valor).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
