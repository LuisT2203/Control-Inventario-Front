import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../service/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @if (texto) {
      <div class="toast show" role="status">{{ texto }}</div>
    }
  `,
  styles: [`
    .toast {
      position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%);
      max-width: 90vw; background: var(--ink); color: var(--card);
      padding: 12px 18px; border-radius: 10px; z-index: 30;
    }
  `]
})
export class ToastComponent implements OnInit {
  texto = '';
  private tt: ReturnType<typeof setTimeout> | null = null;

  constructor(private toast: ToastService) { }

  ngOnInit(): void {
    this.toast.mensaje$.subscribe(m => {
      this.texto = m;
      if (this.tt) {
        clearTimeout(this.tt);
      }
      this.tt = setTimeout(() => {
        this.texto = '';
      }, 2600);
    });
  }
}
