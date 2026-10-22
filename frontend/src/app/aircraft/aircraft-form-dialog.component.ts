import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { AircraftService, Aircraft } from '../core/services/aircraft.service';

@Component({
  selector: 'app-aircraft-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit Aircraft' : 'Register Aircraft' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="form" id="aircraft-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Registration</mat-label>
          <input matInput formControlName="registration" placeholder="e.g. VT-ABC">
          <mat-error>Required, max 20 characters</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Aircraft Type</mat-label>
          <input matInput formControlName="type" placeholder="e.g. Cessna 172">
          <mat-error>Required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Manufacturer</mat-label>
          <input matInput formControlName="manufacturer">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Serial Number</mat-label>
          <input matInput formControlName="serialNo">
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Total Hours</mat-label>
            <input matInput type="number" formControlName="totalHours" min="0" step="0.1">
            <mat-error>Required, min 0</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Total Cycles</mat-label>
            <input matInput type="number" formControlName="totalCycles" min="0">
            <mat-error>Required, min 0</mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="ACTIVE">Active</mat-option>
            <mat-option value="GROUNDED">Grounded</mat-option>
            <mat-option value="MAINTENANCE">Maintenance</mat-option>
            <mat-option value="RETIRED">Retired</mat-option>
          </mat-select>
        </mat-form-field>

        <p class="error-msg" *ngIf="errorMsg" role="alert">{{ errorMsg }}</p>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary"
              [disabled]="form.invalid || saving"
              (click)="save()">
        {{ saving ? 'Saving…' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    .row { display: flex; gap: 16px; }
    .half-width { flex: 1; }
    .error-msg { color: #c62828; font-size: 14px; }
    mat-dialog-content { min-width: 400px; }
  `]
})
export class AircraftFormDialogComponent {
  form: FormGroup;
  saving = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private aircraftService: AircraftService,
    private dialogRef: MatDialogRef<AircraftFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Aircraft | null,
  ) {
    this.form = this.fb.group({
      registration: [data?.registration ?? '', [Validators.required, Validators.maxLength(20)]],
      type:         [data?.type ?? '', Validators.required],
      manufacturer: [data?.manufacturer ?? ''],
      serialNo:     [data?.serialNo ?? ''],
      totalHours:   [data?.totalHours ?? 0, [Validators.required, Validators.min(0)]],
      totalCycles:  [data?.totalCycles ?? 0, [Validators.required, Validators.min(0)]],
      status:       [data?.status ?? 'ACTIVE', Validators.required],
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMsg = '';

    const payload = this.form.value;
    const request = this.data
      ? this.aircraftService.update(this.data.id, payload)
      : this.aircraftService.create(payload);

    request.subscribe({
      next: (saved) => this.dialogRef.close(saved),
      error: (err) => {
        this.saving = false;
        this.errorMsg = err.error?.detail ?? 'Failed to save aircraft';
      }
    });
  }
}
