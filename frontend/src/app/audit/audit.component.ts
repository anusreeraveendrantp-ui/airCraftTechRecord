import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { environment } from '../../environments/environment';

interface AuditEntry {
  id: number;
  entity: string;
  entityId: number;
  action: string;
  newValue: string;
  timestamp: string;
}

interface Page<T> {
  content: T[];
  totalElements: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatPaginatorModule,
  ],
  template: `
    <div class="page-container">
      <h1 class="page-title">Audit Log</h1>

      <mat-card class="filter-card">
        <mat-card-content>
          <div class="filter-row">
            <mat-form-field appearance="outline">
              <mat-label>Entity</mat-label>
              <input matInput [(ngModel)]="filterEntity" placeholder="e.g. Aircraft">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>From</mat-label>
              <input matInput type="date" [(ngModel)]="filterFrom">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>To</mat-label>
              <input matInput type="date" [(ngModel)]="filterTo">
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="search()">Search</button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content>
          <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
          <table class="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Entity</th>
                <th>Entity ID</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of entries">
                <td>{{ e.timestamp | date:'medium' }}</td>
                <td>{{ e.entity }}</td>
                <td>{{ e.entityId }}</td>
                <td>{{ e.action }}</td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="!loading && !entries.length" class="empty">No audit log entries found.</p>

          <mat-paginator
            [length]="totalElements"
            [pageSize]="pageSize"
            [pageIndex]="pageIndex"
            [pageSizeOptions]="[25, 50, 100]"
            (page)="onPage($event)">
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-title { margin: 0 0 24px; font-size: 24px; font-weight: 500; }
    .filter-card { margin-bottom: 16px; }
    .filter-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 10px 12px; background: #f5f5f5; border-bottom: 2px solid #e0e0e0; font-size: 13px; color: #555; }
    .data-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
    .empty { text-align: center; padding: 32px; color: #999; }
  `]
})
export class AuditComponent implements OnInit {
  entries: AuditEntry[] = [];
  totalElements = 0;
  pageSize = 50;
  pageIndex = 0;
  loading = false;

  filterEntity = '';
  filterFrom = '';
  filterTo = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.load();
  }

  search(): void {
    this.pageIndex = 0;
    this.load();
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  load(): void {
    this.loading = true;
    let url = `${environment.apiUrl}/audit-log?page=${this.pageIndex}&size=${this.pageSize}`;
    if (this.filterEntity) url += `&entity=${encodeURIComponent(this.filterEntity)}`;
    if (this.filterFrom) url += `&from=${this.filterFrom}`;
    if (this.filterTo)   url += `&to=${this.filterTo}`;

    this.http.get<Page<AuditEntry>>(url).subscribe({
      next: (page) => {
        this.entries = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
