import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AircraftService, DueItem } from '../../core/services/aircraft.service';
import { AddRecordDialogComponent } from '../records/add-record-dialog.component';

@Component({
  selector: 'app-due-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  template: `
    <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>

    <div class="due-list-header" *ngIf="!loading">
      <button mat-stroked-button color="primary" (click)="logMaintenance()">
        <mat-icon>add</mat-icon> Log Maintenance
      </button>
    </div>

    <table class="due-table" *ngIf="!loading && items.length">
      <thead>
        <tr>
          <th>Task</th>
          <th>Last Done</th>
          <th>Next Due (h)</th>
          <th>Next Due (cycles)</th>
          <th>Next Due (date)</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of items"
            [class.row-overdue]="item.status === 'OVERDUE'"
            [class.row-due-soon]="item.status === 'DUE_SOON'">
          <td>{{ item.templateTitle }}</td>
          <td>{{ item.lastCompletedDate ?? '—' }}</td>
          <td>{{ item.nextDueHours != null ? (item.nextDueHours | number:'1.1-1') : '—' }}</td>
          <td>{{ item.nextDueCycles ?? '—' }}</td>
          <td>{{ item.nextDueDate ?? '—' }}</td>
          <td>
            <span class="status-badge"
                  [class.status-badge--ok]="item.status === 'OK'"
                  [class.status-badge--due-soon]="item.status === 'DUE_SOON'"
                  [class.status-badge--overdue]="item.status === 'OVERDUE'">
              {{ item.status === 'DUE_SOON' ? 'Due Soon' : (item.status | titlecase) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <p class="empty" *ngIf="!loading && !items.length">
      No task templates found for this aircraft type.
    </p>
  `,
  styles: [`
    .due-list-header { padding: 8px 0 12px; }
    .due-table { width: 100%; border-collapse: collapse; }
    .due-table th { text-align: left; padding: 10px 12px; background: #f5f5f5; border-bottom: 2px solid #e0e0e0; font-size: 13px; color: #555; }
    .due-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
    .row-overdue td { background: #fff8f8; border-left: 3px solid #c62828; }
    .row-due-soon td { background: #fffde7; border-left: 3px solid #e65100; }
    .empty { text-align: center; padding: 32px; color: #999; }
  `]
})
export class DueListComponent implements OnChanges {
  @Input() aircraftId!: number;
  @Output() recordSaved = new EventEmitter<void>();

  items: DueItem[] = [];
  loading = false;

  constructor(
    private aircraftService: AircraftService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnChanges(): void {
    if (this.aircraftId) this.load();
  }

  load(): void {
    this.loading = true;
    this.aircraftService.getDueList(this.aircraftId).subscribe({
      next: (items) => { this.items = items; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  logMaintenance(): void {
    const ref = this.dialog.open(AddRecordDialogComponent, {
      width: '520px',
      data: { aircraftId: this.aircraftId },
    });
    ref.afterClosed().subscribe(saved => {
      if (saved) {
        this.snackBar.open('Maintenance record saved', 'OK', { duration: 3000 });
        this.load(); // Refresh the due list
        this.recordSaved.emit();
      }
    });
  }
}
