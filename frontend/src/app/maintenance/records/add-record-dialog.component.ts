import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { AircraftService } from '../../core/services/aircraft.service';
import { MaintenanceService, TaskTemplate } from '../../core/services/maintenance.service';

export interface AddRecordDialogData {
  aircraftId: number;
}

@Component({
  selector: 'app-add-record-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Log Maintenance Record</h2>

    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Task Template</mat-label>
          <mat-select formControlName="templateId">
            <mat-option *ngFor="let t of templates" [value]="t.id">{{ t.title }}</mat-option>
          </mat-select>
          <mat-error>Required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Date Performed</mat-label>
          <input matInput [matDatepicker]="dp" formControlName="performedDate">
          <mat-datepicker-toggle matIconSuffix [for]="dp"></mat-datepicker-toggle>
          <mat-datepicker #dp></mat-datepicker>
          <mat-error>Required</mat-error>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline" class="half">
            <mat-label>Hours at Completion</mat-label>
            <input matInput type="number" formControlName="hoursAtCompletion" min="0" step="0.1">
            <mat-error>Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half">
            <mat-label>Cycles at Completion</mat-label>
            <input matInput type="number" formControlName="cyclesAtCompletion" min="0">
            <mat-error>Required</mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Performed By</mat-label>
          <input matInput formControlName="performedBy">
          <mat-error>Required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Certified By</mat-label>
          <input matInput formControlName="certifiedBy">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Remarks</mat-label>
          <textarea matInput formControlName="remarks" rows="3"></textarea>
        </mat-form-field>

        <p class="error-msg" *ngIf="errorMsg" role="alert">{{ errorMsg }}</p>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary"
              [disabled]="form.invalid || saving"
              (click)="save()">
        {{ saving ? 'Saving…' : 'Save Record' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    .row { display: flex; gap: 16px; }
    .half { flex: 1; }
    .error-msg { color: #c62828; font-size: 14px; }
    mat-dialog-content { min-width: 420px; }
  `]
})
export class AddRecordDialogComponent implements OnInit {
  form: FormGroup;
  templates: TaskTemplate[] = [];
  saving = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private aircraftService: AircraftService,
    private maintenanceService: MaintenanceService,
    private dialogRef: MatDialogRef<AddRecordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddRecordDialogData,
  ) {
    this.form = this.fb.group({
      templateId:          [null, Validators.required],
      performedDate:       [new Date(), Validators.required],
      hoursAtCompletion:   [0, [Validators.required, Validators.min(0)]],
      cyclesAtCompletion:  [0, [Validators.required, Validators.min(0)]],
      performedBy:         ['', Validators.required],
      certifiedBy:         [''],
      remarks:             [''],
    });
  }

  ngOnInit(): void {
    this.maintenanceService.getTemplates().subscribe(t => this.templates = t);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;

    const raw = this.form.value;
    const payload = {
      ...raw,
      // Convert Date object to ISO date string (yyyy-MM-dd)
      performedDate: raw.performedDate instanceof Date
        ? raw.performedDate.toISOString().split('T')[0]
        : raw.performedDate,
    };

    this.aircraftService.addMaintenanceRecord(this.data.aircraftId, payload).subscribe({
      next: (record) => this.dialogRef.close(record),
      error: (err) => {
        this.saving = false;
        this.errorMsg = err.error?.detail ?? 'Failed to save record';
      }
    });
  }
}
