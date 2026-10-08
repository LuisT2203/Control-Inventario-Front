import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-emblema',
  standalone: true,
  template: `
    @if (codigo === 'RELIGIOSOS') {
      <svg [attr.width]="tam" [attr.height]="tam" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#fff" stroke="#C9A24B" stroke-width="2"/><ellipse cx="24" cy="24" rx="15" ry="19.5" fill="#DCE8FF" stroke="#C9A24B" stroke-width="1.5"/><g fill="#C9A24B"><circle cx="37.5" cy="24" r="1.4"/><circle cx="35.7" cy="33" r="1.4"/><circle cx="30.8" cy="39.6" r="1.4"/><circle cx="24" cy="42" r="1.4"/><circle cx="17.3" cy="39.6" r="1.4"/><circle cx="12.3" cy="33" r="1.4"/><circle cx="10.5" cy="24" r="1.4"/><circle cx="12.3" cy="15" r="1.4"/><circle cx="17.3" cy="8.4" r="1.4"/><circle cx="24" cy="6" r="1.4"/><circle cx="30.8" cy="8.4" r="1.4"/><circle cx="35.7" cy="15" r="1.4"/></g><text x="24" y="30" text-anchor="middle" font-size="17" font-weight="700" font-family="Georgia,serif" fill="#14213D">M</text></svg>
    } @else {
      <svg [attr.width]="tam" [attr.height]="tam" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#fff" stroke="#F28B6E" stroke-width="2"/><path d="M17 12l-7 4 3 6 4-1.5V37h14V20.5L35 22l3-6-7-4c0 3-3.5 5-7 5s-7-2-7-5z" fill="#CDEFD9" stroke="#14213D" stroke-width="1.8" stroke-linejoin="round"/></svg>
    }
  `
})
export class EmblemaComponent {
  @Input() codigo = '';
  @Input() tam = 40;
}
