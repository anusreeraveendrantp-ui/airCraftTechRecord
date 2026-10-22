import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FleetSummary {
  totalAircraft: number;
  active: number;
  grounded: number;
  maintenance: number;
  overdueTaskCount: number;
  dueSoonTaskCount: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  getSummary(): Observable<FleetSummary> {
    return this.http.get<FleetSummary>(`${environment.apiUrl}/dashboard/summary`);
  }
}
