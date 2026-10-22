import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type Status = 'OK' | 'DUE_SOON' | 'OVERDUE' | 'ACTIVE' | 'GROUNDED' | 'MAINTENANCE' | 'RETIRED'
            | 'COMPLIED' | 'PENDING' | 'NOT_APPLICABLE' | string;

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge"
          [class.status-badge--ok]="isOk"
          [class.status-badge--due-soon]="isDueSoon"
          [class.status-badge--overdue]="isOverdue">
      {{ label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input() status: Status = 'OK';

  get label(): string {
    return this.status.replace(/_/g, ' ');
  }

  get isOk(): boolean {
    return ['OK', 'ACTIVE', 'COMPLIED', 'NOT_APPLICABLE'].includes(this.status);
  }

  get isDueSoon(): boolean {
    return ['DUE_SOON', 'MAINTENANCE', 'PENDING'].includes(this.status);
  }

  get isOverdue(): boolean {
    return ['OVERDUE', 'GROUNDED', 'RETIRED'].includes(this.status);
  }
}
