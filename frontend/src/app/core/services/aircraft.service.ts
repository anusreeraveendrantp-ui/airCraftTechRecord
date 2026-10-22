import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Aircraft {
  id: number;
  registration: string;
  type: string;
  manufacturer: string;
  serialNo: string;
  totalHours: number;
  totalCycles: number;
  status: 'ACTIVE' | 'GROUNDED' | 'MAINTENANCE' | 'RETIRED';
  createdAt: string;
  updatedAt: string;
}

export interface DueItem {
  templateId: number;
  templateTitle: string;
  lastCompletedDate: string | null;
  lastCompletedHours: number | null;
  nextDueHours: number | null;
  nextDueCycles: number | null;
  nextDueDate: string | null;
  status: 'OK' | 'DUE_SOON' | 'OVERDUE';
}

export interface MaintenanceRecord {
  id: number;
  template: { id: number; title: string };
  performedDate: string;
  hoursAtCompletion: number;
  cyclesAtCompletion: number;
  performedBy: string;
  certifiedBy: string;
  remarks: string;
}

export interface FlightLog {
  id: number;
  flightDate: string;
  hoursFlown: number;
  cycles: number;
  pilotName: string;
  departureIcao: string;
  arrivalIcao: string;
}

@Injectable({ providedIn: 'root' })
export class AircraftService {

  private base = `${environment.apiUrl}/aircraft`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Aircraft[]> {
    return this.http.get<Aircraft[]>(this.base);
  }

  getById(id: number): Observable<Aircraft> {
    return this.http.get<Aircraft>(`${this.base}/${id}`);
  }

  create(payload: Partial<Aircraft>): Observable<Aircraft> {
    return this.http.post<Aircraft>(this.base, payload);
  }

  update(id: number, payload: Partial<Aircraft>): Observable<Aircraft> {
    return this.http.put<Aircraft>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getDueList(id: number): Observable<DueItem[]> {
    return this.http.get<DueItem[]>(`${this.base}/${id}/due-list`);
  }

  getMaintenanceRecords(id: number): Observable<MaintenanceRecord[]> {
    return this.http.get<MaintenanceRecord[]>(`${this.base}/${id}/maintenance-records`);
  }

  addMaintenanceRecord(id: number, payload: any): Observable<MaintenanceRecord> {
    return this.http.post<MaintenanceRecord>(`${this.base}/${id}/maintenance-records`, payload);
  }

  getFlightLogs(id: number): Observable<FlightLog[]> {
    return this.http.get<FlightLog[]>(`${this.base}/${id}/flight-logs`);
  }

  logFlight(id: number, payload: any): Observable<FlightLog> {
    return this.http.post<FlightLog>(`${this.base}/${id}/flight-logs`, payload);
  }
}
