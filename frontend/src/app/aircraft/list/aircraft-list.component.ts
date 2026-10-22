import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AircraftService, Aircraft } from '../../core/services/aircraft.service';
import { AircraftFormDialogComponent } from '../aircraft-form-dialog.component';

@Component({
  selector: 'app-aircraft-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Aircraft Fleet</h1>
        <button mat-raised-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> Register Aircraft
        </button>
      </div>

      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="aircraft" class="full-width">

            <ng-container matColumnDef="registration">
              <th mat-header-cell *matHeaderCellDef>Registration</th>
              <td mat-cell *matCellDef="let a">
                <a [routerLink]="['/aircraft', a.id]" class="reg-link">{{ a.registration }}</a>
              </td>
            </ng-container>

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let a">{{ a.type }}</td>
            </ng-container>

            <ng-container matColumnDef="manufacturer">
              <th mat-header-cell *matHeaderCellDef>Manufacturer</th>
              <td mat-cell *matCellDef="let a">{{ a.manufacturer }}</td>
            </ng-container>

            <ng-container matColumnDef="hours">
              <th mat-header-cell *matHeaderCellDef>Total Hours</th>
              <td mat-cell *matCellDef="let a">{{ a.totalHours | number:'1.1-1' }}</td>
            </ng-container>

            <ng-container matColumnDef="cycles">
              <th mat-header-cell *matHeaderCellDef>Cycles</th>
              <td mat-cell *matCellDef="let a">{{ a.totalCycles }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let a">
                <span class="status-badge"
                      [class.status-badge--ok]="a.status === 'ACTIVE'"
                      [class.status-badge--due-soon]="a.status === 'MAINTENANCE'"
                      [class.status-badge--overdue]="a.status === 'GROUNDED' || a.status === 'RETIRED'">
                  {{ a.status }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let a">
                <a mat-icon-button [routerLink]="['/aircraft', a.id]" aria-label="View aircraft details">
                  <mat-icon>arrow_forward</mat-icon>
                </a>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="7" style="text-align:center;padding:24px">
                No aircraft registered yet.
              </td>
            </tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-title { margin: 0; font-size: 24px; font-weight: 500; }
    .full-width { width: 100%; }
    .reg-link { color: #1a237e; font-weight: 500; text-decoration: none; }
    .reg-link:hover { text-decoration: underline; }
  `]
})
export class AircraftListComponent implements OnInit {
  aircraft: Aircraft[] = [];
  loading = true;
  columns = ['registration', 'type', 'manufacturer', 'hours', 'cycles', 'status', 'actions'];

  constructor(
    private aircraftService: AircraftService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.aircraftService.getAll().subscribe({
      next: (list) => { this.aircraft = list; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openForm(): void {
    const ref = this.dialog.open(AircraftFormDialogComponent, { width: '500px' });
    ref.afterClosed().subscribe(saved => {
      if (saved) {
        this.snackBar.open('Aircraft registered', 'OK', { duration: 3000 });
        this.load();
      }
    });
  }
}
