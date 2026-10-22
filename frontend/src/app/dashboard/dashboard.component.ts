import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { forkJoin } from 'rxjs';
import { AircraftService, Aircraft, DueItem } from '../core/services/aircraft.service';

interface FleetSummary {
  total: number;
  active: number;
  grounded: number;
  maintenance: number;
  overdueCount: number;
  dueSoonCount: number;
}

interface AircraftDueStatus {
  aircraft: Aircraft;
  overdue: number;
  dueSoon: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="page-container">
      <h1 class="page-title">Fleet Dashboard</h1>

      <!-- Summary cards -->
      <div class="summary-grid" *ngIf="summary">
        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-icon blue"><mat-icon>airplanemode_active</mat-icon></div>
            <div class="summary-value">{{ summary.total }}</div>
            <div class="summary-label">Total Aircraft</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-icon green"><mat-icon>check_circle</mat-icon></div>
            <div class="summary-value">{{ summary.active }}</div>
            <div class="summary-label">Active</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card warn">
          <mat-card-content>
            <div class="summary-icon amber"><mat-icon>schedule</mat-icon></div>
            <div class="summary-value">{{ summary.dueSoonCount }}</div>
            <div class="summary-label">Due Soon</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card danger">
          <mat-card-content>
            <div class="summary-icon red"><mat-icon>warning</mat-icon></div>
            <div class="summary-value">{{ summary.overdueCount }}</div>
            <div class="summary-label">Overdue Items</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Loading state -->
      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>

      <!-- Fleet status table -->
      <mat-card class="fleet-card" *ngIf="!loading">
        <mat-card-header>
          <mat-card-title>Fleet Maintenance Status</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table class="fleet-table" *ngIf="fleetStatus.length">
            <thead>
              <tr>
                <th>Registration</th>
                <th>Type</th>
                <th>Hours</th>
                <th>Cycles</th>
                <th>Status</th>
                <th>Overdue</th>
                <th>Due Soon</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of fleetStatus"
                  [class.row-overdue]="row.overdue > 0"
                  [class.row-due-soon]="row.overdue === 0 && row.dueSoon > 0">
                <td><strong>{{ row.aircraft.registration }}</strong></td>
                <td>{{ row.aircraft.type }}</td>
                <td>{{ row.aircraft.totalHours | number:'1.1-1' }}</td>
                <td>{{ row.aircraft.totalCycles }}</td>
                <td>
                  <span class="status-badge"
                        [class.status-badge--ok]="row.aircraft.status === 'ACTIVE'"
                        [class.status-badge--due-soon]="row.aircraft.status === 'MAINTENANCE'"
                        [class.status-badge--overdue]="row.aircraft.status === 'GROUNDED'">
                    {{ row.aircraft.status }}
                  </span>
                </td>
                <td>
                  <span *ngIf="row.overdue > 0" class="count-badge red">{{ row.overdue }}</span>
                  <span *ngIf="row.overdue === 0" class="count-badge green">0</span>
                </td>
                <td>
                  <span *ngIf="row.dueSoon > 0" class="count-badge amber">{{ row.dueSoon }}</span>
                  <span *ngIf="row.dueSoon === 0" class="count-badge green">0</span>
                </td>
                <td>
                  <a mat-button color="primary"
                     [routerLink]="['/aircraft', row.aircraft.id]">View</a>
                </td>
              </tr>
            </tbody>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-title { margin: 0 0 24px; font-size: 24px; font-weight: 500; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .summary-card { text-align: center; }
    .summary-card mat-card-content { padding: 16px; }
    .summary-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; }
    .summary-icon.blue { background: #e3f2fd; color: #1565c0; }
    .summary-icon.green { background: #e8f5e9; color: #2e7d32; }
    .summary-icon.amber { background: #fff3e0; color: #e65100; }
    .summary-icon.red { background: #ffebee; color: #c62828; }
    .summary-value { font-size: 32px; font-weight: 700; }
    .summary-label { color: #666; font-size: 14px; }
    .fleet-card { margin-top: 8px; }
    .fleet-table { width: 100%; border-collapse: collapse; }
    .fleet-table th { text-align: left; padding: 8px 12px; background: #f5f5f5; border-bottom: 2px solid #e0e0e0; font-size: 13px; color: #555; }
    .fleet-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
    .fleet-table tr:hover td { background: #fafafa; }
    .row-overdue td { border-left: 3px solid #c62828; }
    .row-due-soon td { border-left: 3px solid #e65100; }
    .count-badge { display: inline-block; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600; }
    .count-badge.red { background: #ffebee; color: #c62828; }
    .count-badge.amber { background: #fff3e0; color: #e65100; }
    .count-badge.green { background: #e8f5e9; color: #2e7d32; }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  summary: FleetSummary | null = null;
  fleetStatus: AircraftDueStatus[] = [];

  constructor(private aircraftService: AircraftService) {}

  ngOnInit(): void {
    this.aircraftService.getAll().subscribe({
      next: (aircraftList) => {
        if (!aircraftList.length) {
          this.loading = false;
          return;
        }

        // Fetch due lists for all aircraft in parallel
        const dueRequests = aircraftList.map(a => this.aircraftService.getDueList(a.id));

        forkJoin(dueRequests).subscribe({
          next: (dueResults) => {
            let totalOverdue = 0;
            let totalDueSoon = 0;

            this.fleetStatus = aircraftList.map((aircraft, i) => {
              const dueItems: DueItem[] = dueResults[i];
              const overdue = dueItems.filter(d => d.status === 'OVERDUE').length;
              const dueSoon = dueItems.filter(d => d.status === 'DUE_SOON').length;
              totalOverdue += overdue;
              totalDueSoon += dueSoon;
              return { aircraft, overdue, dueSoon };
            });

            // Sort by severity
            this.fleetStatus.sort((a, b) => b.overdue - a.overdue || b.dueSoon - a.dueSoon);

            this.summary = {
              total: aircraftList.length,
              active: aircraftList.filter(a => a.status === 'ACTIVE').length,
              grounded: aircraftList.filter(a => a.status === 'GROUNDED').length,
              maintenance: aircraftList.filter(a => a.status === 'MAINTENANCE').length,
              overdueCount: totalOverdue,
              dueSoonCount: totalDueSoon,
            };

            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }
}
