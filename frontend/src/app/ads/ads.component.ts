import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { environment } from '../../environments/environment';

interface AD {
  id: number;
  adNumber: string;
  title: string;
  appliesToType: string;
  effectiveDate: string;
  complianceDeadline: string;
  recurring: boolean;
}

@Component({
  selector: 'app-ads',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
  ],
  template: `
    <div class="page-container">
      <h1 class="page-title">Airworthiness Directives</h1>
      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
      <mat-card>
        <mat-card-content>
          <table class="data-table">
            <thead>
              <tr>
                <th>AD Number</th>
                <th>Title</th>
                <th>Applies To</th>
                <th>Effective Date</th>
                <th>Compliance Deadline</th>
                <th>Recurring</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ad of ads">
                <td><strong>{{ ad.adNumber }}</strong></td>
                <td>{{ ad.title }}</td>
                <td>{{ ad.appliesToType ?? 'All Types' }}</td>
                <td>{{ ad.effectiveDate }}</td>
                <td>{{ ad.complianceDeadline }}</td>
                <td>
                  <span class="status-badge"
                        [class.status-badge--ok]="!ad.recurring"
                        [class.status-badge--due-soon]="ad.recurring">
                    {{ ad.recurring ? 'Yes' : 'No' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="!loading && !ads.length" class="empty">No airworthiness directives found.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-title { margin: 0 0 24px; font-size: 24px; font-weight: 500; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 10px 12px; background: #f5f5f5; border-bottom: 2px solid #e0e0e0; font-size: 13px; color: #555; }
    .data-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
    .empty { text-align: center; padding: 32px; color: #999; }
  `]
})
export class AdsComponent implements OnInit {
  ads: AD[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<AD[]>(`${environment.apiUrl}/ads`).subscribe({
      next: (list) => { this.ads = list; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
