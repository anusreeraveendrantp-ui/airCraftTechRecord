import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { AircraftService } from '../core/services/aircraft.service';

export interface LogFlightDialogData {
  aircraftId: number;
  currentHours: number;
  currentCycles: number;
}

@Component({
  selector: 'app-log-flight-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Log Flight</h2>
    <p class="current-totals">
      Current: <strong>{{ data.currentHours | number:'1.1-1' }} h</strong>
      / <strong>{{ data.currentCycles }} cycles</strong>
    </p>

    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Flight Date</mat-label>
          <input matInput [matDatepicker]="dp" formControlName="flightDate">
          <mat-datepicker-toggle matIconSuffix [for]="dp"></mat-datepicker-toggle>
          <mat-datepicker #dp></mat-datepicker>
          <mat-error>Required</mat-error>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline" class="half">
            <mat-label>Hours Flown</mat-label>
            <input matInput type="number" formControlName="hoursFlown" min="0.1" step="0.1">
            <mat-error>Required, min 0.1</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half">
            <mat-label>Cycles (Landings)</mat-label>
            <input matInput type="number" formControlName="cycles" min="0">
            <mat-error>Required</mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Pilot Name</mat-label>
          <input matInput formControlName="pilotName">
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline" class="half">
            <mat-label>Departure (ICAO)</mat-label>
            <input matInput formControlName="departureIcao" maxlength="4" placeholder="e.g. VIDP">
          </mat-form-field>

          <mat-form-field appearance="outline" class="half">
            <mat-label>Arrival (ICAO)</mat-label>
            <input matInput formControlName="arrivalIcao" maxlength="4" placeholder="e.g. VABB">
          </mat-form-field>
        </div>

        <p class="error-msg" *ngIf="errorMsg" role="alert">{{ errorMsg }}</p>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary"
              [disabled]="form.invalid || saving"
              (click)="save()">
        {{ saving ? 'Saving…' : 'Log Flight' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .current-totals { margin: -8px 24px 0; color: #666; font-size: 14px; }
    .full-width { width: 100%; }
    .row { display: flex; gap: 16px; }
    .half { flex: 1; }
    .error-msg { color: #c62828; font-size: 14px; }
    mat-dialog-content { min-width: 400px; }
  `]
})
export class LogFlightDialogComponent {
  form: FormGroup;
  saving = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private aircraftService: AircraftService,
    private dialogRef: MatDialogRef<LogFlightDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LogFlightDialogData,
  ) {
    this.form = this.fb.group({
      flightDate:     [new Date(), Validators.required],
      hoursFlown:     [1.0, [Validators.required, Validators.min(0.1)]],
      cycles:         [1, [Validators.required, Validators.min(0)]],
      pilotName:      [''],
      departureIcao:  [''],
      arrivalIcao:    [''],
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;

    const raw = this.form.value;
    const payload = {
      ...raw,
      flightDate: raw.flightDate instanceof Date
        ? raw.flightDate.toISOString().split('T')[0]
        : raw.flightDate,
    };

    this.aircraftService.logFlight(this.data.aircraftId, payload).subscribe({
      next: (log) => this.dialogRef.close(log),
      error: (err) => {
        this.saving = false;
        this.errorMsg = err.error?.detail ?? 'Failed to log flight';
      }
    });
  }
}
