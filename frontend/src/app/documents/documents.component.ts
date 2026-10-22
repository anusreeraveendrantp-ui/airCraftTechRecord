import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AircraftService, Aircraft } from '../core/services/aircraft.service';
import { environment } from '../../environments/environment';

interface Document {
  id: number;
  fileName: string;
  docType: string;
  uploadedBy: string;
  uploadedAt: string;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="page-container">
      <h1 class="page-title">Document Management</h1>

      <!-- Upload section -->
      <mat-card class="upload-card">
        <mat-card-header><mat-card-title>Upload Document</mat-card-title></mat-card-header>
        <mat-card-content>
          <div class="upload-row">
            <mat-form-field appearance="outline">
              <mat-label>Aircraft</mat-label>
              <mat-select [(ngModel)]="selectedAircraftId" (ngModelChange)="onAircraftChange()">
                <mat-option *ngFor="let a of aircraft" [value]="a.id">{{ a.registration }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Document Type</mat-label>
              <mat-select [(ngModel)]="docType">
                <mat-option value="MAINTENANCE_RELEASE">Maintenance Release</mat-option>
                <mat-option value="LOGBOOK_PAGE">Logbook Page</mat-option>
                <mat-option value="AD_COMPLIANCE">AD Compliance</mat-option>
                <mat-option value="CERTIFICATE">Certificate</mat-option>
                <mat-option value="OTHER">Other</mat-option>
              </mat-select>
            </mat-form-field>

            <input #fileInput type="file" hidden (change)="onFileSelected($event)">
            <button mat-stroked-button (click)="fileInput.click()">
              <mat-icon>attach_file</mat-icon>
              {{ selectedFile ? selectedFile.name : 'Choose File' }}
            </button>

            <button mat-raised-button color="primary"
                    [disabled]="!selectedFile || !selectedAircraftId || uploading"
                    (click)="upload()">
              <mat-icon>cloud_upload</mat-icon> Upload
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Document list -->
      <mat-card>
        <mat-card-header><mat-card-title>Documents</mat-card-title></mat-card-header>
        <mat-card-content>
          <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
          <table class="data-table" *ngIf="documents.length">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Type</th>
                <th>Uploaded By</th>
                <th>Uploaded At</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let doc of documents">
                <td>{{ doc.fileName }}</td>
                <td>{{ doc.docType }}</td>
                <td>{{ doc.uploadedBy }}</td>
                <td>{{ doc.uploadedAt | date:'medium' }}</td>
                <td>
                  <a mat-icon-button [href]="downloadUrl(doc.id)" target="_blank" aria-label="Download document">
                    <mat-icon>download</mat-icon>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="!loading && !documents.length" class="empty">
            {{ selectedAircraftId ? 'No documents for this aircraft.' : 'Select an aircraft to see documents.' }}
          </p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-title { margin: 0 0 24px; font-size: 24px; font-weight: 500; }
    .upload-card { margin-bottom: 24px; }
    .upload-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 10px 12px; background: #f5f5f5; border-bottom: 2px solid #e0e0e0; font-size: 13px; color: #555; }
    .data-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
    .empty { text-align: center; padding: 32px; color: #999; }
  `]
})
export class DocumentsComponent implements OnInit {
  aircraft: Aircraft[] = [];
  documents: Document[] = [];
  selectedAircraftId: number | null = null;
  selectedFile: File | null = null;
  docType = 'OTHER';
  loading = false;
  uploading = false;

  constructor(
    private aircraftService: AircraftService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.aircraftService.getAll().subscribe(list => this.aircraft = list);
  }

  onAircraftChange(): void {
    if (!this.selectedAircraftId) return;
    this.loading = true;
    this.http.get<Document[]>(`${environment.apiUrl}/aircraft/${this.selectedAircraftId}/documents`)
      .subscribe({
        next: (docs) => { this.documents = docs; this.loading = false; },
        error: () => { this.loading = false; }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  upload(): void {
    if (!this.selectedFile || !this.selectedAircraftId) return;
    this.uploading = true;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('aircraftId', String(this.selectedAircraftId));
    formData.append('docType', this.docType);

    this.http.post<Document>(`${environment.apiUrl}/documents/upload`, formData).subscribe({
      next: () => {
        this.uploading = false;
        this.selectedFile = null;
        this.snackBar.open('Document uploaded', 'OK', { duration: 3000 });
        this.onAircraftChange();
      },
      error: () => {
        this.uploading = false;
        this.snackBar.open('Upload failed', 'OK', { duration: 3000 });
      }
    });
  }

  downloadUrl(docId: number): string {
    return `${environment.apiUrl}/documents/${docId}/download`;
  }
}
