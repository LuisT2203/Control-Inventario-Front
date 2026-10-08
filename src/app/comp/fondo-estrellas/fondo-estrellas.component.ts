import { Component } from '@angular/core';

const D = 'M0 -10L2.5 -2.5L10 0L2.5 2.5L0 10L-2.5 2.5L-10 0L-2.5 -2.5Z';
const P: [number, number, number][] = [
  [40, 50, 1], [120, 180, .6], [210, 70, .8], [300, 200, .5], [370, 60, 1.1],
  [450, 150, .7], [530, 50, .9], [610, 130, .6], [690, 60, 1], [760, 170, .7],
  [60, 300, .8], [150, 400, 1.1], [250, 320, .6], [340, 450, .9], [430, 340, .7],
  [520, 430, 1], [620, 330, .6], [710, 440, .9], [780, 300, .7], [90, 480, .6],
  [200, 250, .5], [400, 250, .5], [560, 240, .55], [660, 230, .5], [750, 380, .55]
];

@Component({
  selector: 'app-fondo-estrellas',
  standalone: true,
  template: `
    <svg viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g fill="#AFC3FF" opacity=".55">
        @for (s of estrellas; track s) {
          <path [attr.transform]="'translate(' + s[0] + ' ' + s[1] + ') scale(' + s[2] + ')'" [attr.d]="forma" />
        }
      </g>
    </svg>
  `,
  styles: [':host { position: absolute; inset: 0; pointer-events: none; } svg { width: 100%; height: 100%; display: block; }']
})
export class FondoEstrellasComponent {
  forma = D;
  estrellas = P;
}
