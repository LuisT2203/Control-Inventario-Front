import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-drawer',
  standalone: true,
  template: `
    <div class="dw open">
      <div class="bd" (click)="cerrar.emit()"></div>
      <aside class="dr" role="dialog" aria-modal="true" aria-label="Detalle">
        <div class="dh">
          <h2>{{ titulo }}</h2>
          <button class="x" (click)="cerrar.emit()" aria-label="Cerrar">×</button>
        </div>
        <ng-content></ng-content>
      </aside>
    </div>
  `,
  styles: [`
    .dw { position: fixed; inset: 0; z-index: 20; }
    .bd { position: absolute; inset: 0; background: rgba(0,0,0,.42); }
    .dr {
      position: absolute; top: 0; right: 0; bottom: 0; width: min(440px, 100%);
      background: var(--card); border-left: 1px solid var(--line); overflow: auto; padding: 18px;
    }
    .dh { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 6px; }
    .dh h2 { margin: 0; font-size: 1.4rem; }
    .x { width: 52px; height: 52px; font-size: 1.6rem; border-radius: 12px; border: 2px solid var(--ink); background: var(--card); }
  `]
})
export class DrawerComponent {
  @Input() titulo = 'Detalle';
  @Output() cerrar = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cerrar.emit();
  }
}
