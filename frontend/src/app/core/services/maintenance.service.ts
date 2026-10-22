import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TaskTemplate {
  id: number;
  title: string;
  description: string;
  intervalHours: number | null;
  intervalCycles: number | null;
  intervalDays: number | null;
  appliesToType: string | null;
}

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  constructor(private http: HttpClient) {}

  getTemplates(): Observable<TaskTemplate[]> {
    return this.http.get<TaskTemplate[]>(`${environment.apiUrl}/task-templates`);
  }

  createTemplate(payload: Partial<TaskTemplate>): Observable<TaskTemplate> {
    return this.http.post<TaskTemplate>(`${environment.apiUrl}/task-templates`, payload);
  }
}
