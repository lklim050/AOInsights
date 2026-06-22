import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <svg
      [attr.width]="width"
      [attr.height]="height"
      viewBox="0 0 270 60"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="aoiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#22d3ee" />
          <stop offset="55%" style="stop-color:#14b8a6" />
          <stop offset="100%" style="stop-color:#4ade80" />
        </linearGradient>
      </defs>

      <!-- Main wordmark -->
      <text
        x="0"
        y="44"
        style="font-size:46px;
               font-weight:700;
               fill:url(#aoiGradient);
               font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
               letter-spacing:-1.5px;"
      >
        AOInsights
      </text>

      <!-- Underline accent -->
      <rect
        x="0"
        y="50"
        width="254"
        height="3"
        rx="1.5"
        fill="url(#aoiGradient)"
      />

      <!-- Subtitle -->
      <text
        x="1"
        y="62"
        style="font-size:9px;
               font-weight:500;
               fill:#14b8a6;
               font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
               letter-spacing:0.04em;"
      >
        Automated Opinion Insight
      </text>
    </svg>
  `,
})
export class LogoComponent {
  @Input() width = '260';
  @Input() height = '70';
  // ↑ @Input allows parent to resize the logo
  //   e.g. <app-logo width="180" height="50" /> for navbar
  //        <app-logo width="400" height="100" /> for landing page hero
}
