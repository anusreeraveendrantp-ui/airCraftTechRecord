import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AircraftService, Aircraft, MaintenanceRecord, FlightLog } from '../../core/services/aircraft.service';
import { DueListComponent } from '../../maintenance/due-list/due-list.component';
import { LogFlightDialogComponent } from '../log-flight-dialog.component';

@Component({
  selector: 'app-aircraft-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule,
    DueListComponent,
  ],
  template: `
    <div class="page-container" *ngIf="aircraft; else spinner">

      <!-- Header -->
      <div class="detail-header">
        <div>
          <h1>{{ aircraft.registration }}</h1>
          <p class="subtitle">{{ aircraft.manufacturer }} {{ aircraft.type }}
            <span *ngIf="aircraft.serialNo"> · S/N {{ aircraft.serialNo }}</span>
          </p>
        </div>
        <span class="status-badge"
              [class.status-badge--ok]="aircraft.status === 'ACTIVE'"
              [class.status-badge--due-soon]="aircraft.status === 'MAINTENANCE'"
              [class.status-badge--overdue]="aircraft.status === 'GROUNDED' || aircraft.status === 'RETIRED'">
          {{ aircraft.status }}
        </span>
      </div>

      <!-- Quick stats -->
      <div class="stats-row">
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon>timer</mat-icon>
            <div class="stat-value">{{ aircraft.totalHours | number:'1.1-1' }}</div>
            <div class="stat-label">Total Hours</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon>flight_land</mat-icon>
            <div class="stat-value">{{ aircraft.totalCycles }}</div>
            <div class="stat-label">Total Cycles</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card" [class.danger-card]="overdueCount > 0">
          <mat-card-content>
            <mat-icon [style.color]="overdueCount > 0 ? '#c62828' : '#2e7d32'">warning</mat-icon>
            <div class="stat-value" [style.color]="overdueCount > 0 ? '#c62828' : ''">{{ overdueCount }}</div>
            <div class="stat-label">Overdue Tasks</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon [style.color]="dueSoonCount > 0 ? '#e65100' : '#2e7d32'">schedule</mat-icon>
            <div class="stat-value" [style.color]="dueSoonCount > 0 ? '#e65100' : ''">{{ dueSoonCount }}</div>
            <div class="stat-label">Due Soon</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tabs -->
      <mat-tab-group mat-stretch-tabs="false" animationDuration="150ms">

        <!-- Due List -->
        <mat-tab label="Due List">
          <app-due-list
            [aircraftId]="aircraft.id"
            (recordSaved)="onRecordSaved()">
          </app-due-list>
        </mat-tab>

        <!-- Maintenance Records -->
        <mat-tab label="Maintenance Records">
          <mat-progress-bar mode="indeterminate" *ngIf="loadingRecords"></mat-progress-bar>
          <table class="data-table" *ngIf="!loadingRecords && records.length">
            <thead>
              <tr>
                <th>Task</th>
                <th>Date</th>
                <th>Hours</th>
                <th>Cycles</th>
                <th>Performed By</th>
                <th>Certified By</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of records">
                <td>{{ r.template.title }}</td>
                <td>{{ r.performedDate }}</td>
                <td>{{ r.hoursAtCompletion | number:'1.1-1' }}</td>
                <td>{{ r.cyclesAtCompletion }}</td>
                <td>{{ r.performedBy }}</td>
                <td>{{ r.certifiedBy ?? '—' }}</td>
                <td class="remarks">{{ r.remarks ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
          <p class="empty" *ngIf="!loadingRecords && !records.length">No maintenance records yet.</p>
        </mat-tab>

        <!-- Flight Logs -->
        <mat-tab label="Flight Logs">
          <div class="tab-action-bar">
            <button mat-stroked-button color="primary" (click)="openLogFlight()">
              <mat-icon>add</mat-icon> Log Flight
            </button>
          </div>
          <mat-progress-bar mode="indeterminate" *ngIf="loadingLogs"></mat-progress-bar>
          <table class="data-table" *ngIf="!loadingLogs && flightLogs.length">
            <thead>
              <tr>
                <th>Date</th>
                <th>Hours</th>
                <th>Cycles</th>
                <th>Pilot</th>
                <th>Route</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of flightLogs">
                <td>{{ log.flightDate }}</td>
                <td>{{ log.hoursFlown | number:'1.1-1' }}</td>
                <td>{{ log.cycles }}</td>
                <td>{{ log.pilotName ?? '—' }}</td>
                <td>{{ log.departureIcao ?? '?' }} → {{ log.arrivalIcao ?? '?' }}</td>
              </tr>
            </tbody>
          </table>
          <p class="empty" *ngIf="!loadingLogs && !flightLogs.length">No flight logs yet.</p>
        </mat-tab>

      </mat-tab-group>
    </div>

    <ng-template #spinner>
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    </ng-template>
  `,
  styles: [`
    .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .detail-header h1 { margin: 0; font-size: 28px; font-weight: 600; color: #1a237e; }
    .subtitle { margin: 4px 0 0; color: #666; }
    .stats-row { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .stat-card { flex: 1; min-width: 120px; }
    .stat-card mat-card-content { text-align: center; padding: 16px; }
    .stat-value { font-size: 28px; font-weight: 700; margin: 8px 0 4px; }
    .stat-label { font-size: 13px; color: #666; }
    .danger-card { border-top: 3px solid #c62828 !important; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 10px 12px; background: #f5f5f5; border-bottom: 2px solid #e0e0e0; font-size: 13px; color: #555; }
    .data-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
    .remarks { max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tab-action-bar { padding: 12px 0; }
    .empty { text-align: center; padding: 32px; color: #999; }
  `]
})
export class AircraftDetailComponent implements OnInit {
  @Input() id!: string;

  aircraft: Aircraft | null = null;
  records: MaintenanceRecord[] = [];
  flightLogs: FlightLog[] = [];

  loadingRecords = true;
  loadingLogs = true;

  // Due counts fed from the DueListComponent via the parent re-fetch
  overdueCount = 0;
  dueSoonCount = 0;

  constructor(
    private aircraftService: AircraftService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    const numId = Number(this.id);

    this.aircraftService.getById(numId).subscribe(a => this.aircraft = a);

    // Fetch due list to populate stat cards
    this.aircraftService.getDueList(numId).subscribe(items => {
      this.overdueCount = items.filter(d => d.status === 'OVERDUE').length;
      this.dueSoonCount = items.filter(d => d.status === 'DUE_SOON').length;
    });

    this.loadRecords(numId);
    this.loadFlightLogs(numId);
  }

  loadRecords(id = Number(this.id)): void {
    this.loadingRecords = true;
    this.aircraftService.getMaintenanceRecords(id).subscribe({
      next: (r) => { this.records = r; this.loadingRecords = false; },
      error: () => { this.loadingRecords = false; }
    });
  }

  loadFlightLogs(id = Number(this.id)): void {
    this.loadingLogs = true;
    this.aircraftService.getFlightLogs(id).subscribe({
      next: (l) => { this.flightLogs = l; this.loadingLogs = false; },
      error: () => { this.loadingLogs = false; }
    });
  }

  onRecordSaved(): void {
    this.loadRecords();
    // Re-fetch aircraft to update total hours/cycles display
    this.aircraftService.getById(Number(this.id)).subscribe(a => this.aircraft = a);
  }

  openLogFlight(): void {
    if (!this.aircraft) return;
    const ref = this.dialog.open(LogFlightDialogComponent, {
      width: '480px',
      data: {
        aircraftId: this.aircraft.id,
        currentHours: this.aircraft.totalHours,
        currentCycles: this.aircraft.totalCycles,
      }
    });
    ref.afterClosed().subscribe(saved => {
      if (saved) {
        this.snackBar.open('Flight logged successfully', 'OK', { duration: 3000 });
        // Refresh aircraft totals and logs
        this.aircraftService.getById(Number(this.id)).subscribe(a => this.aircraft = a);
        this.loadFlightLogs();
      }
    });
  }
}
