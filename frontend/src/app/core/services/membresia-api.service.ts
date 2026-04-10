import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaymentStatusResponse {
  hasEntrenamientoMembership: boolean;
  isPaymentUpToDate: boolean | null;
  membresiaName?: string;
  membresiaId?: number;
}

export interface CurrentMonthPaymentResponse {
  id: number;
  userId: number;
  userMembresiaId: number;
  createdAt: string;
  mes: number;
  membresiaId: number | null;
  membresiaNombre: string;
  tipoMembresiaNombre: string | null;
  costo: number | null;
}

export interface Membresia {
  id: number;
  nombre: string;
  descripcion?: string | null;
  dias: string;
  costo: number;
  tipoMembresia?: TipoMembresia;
}

export interface TipoMembresia {
  id: number;
  nombre: string;
}

export interface UserMembresiaResponse {
  userId: number;
  membresiaId: number;
  estadoId: number;
  createdAt: string;
  membresia?: Membresia;
  estado?: any;
}

export interface CurrentMonthReportMetricsResponse {
  pendingPaymentUsersCurrentMonth: number;
  membershipsChosenCurrentMonth: Array<{
    membresiaId: number;
    membresiaNombre: string;
    cantidad: number;
  }>;
}

@Injectable({ providedIn: 'root' })
export class MembresiaApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

  getMyPaymentStatus(): Observable<PaymentStatusResponse> {
    return this.http.get<PaymentStatusResponse>(`${this.apiBaseUrl}/membresia/mi-estado`);
  }

  getMyCurrentMonthPayments(): Observable<CurrentMonthPaymentResponse[]> {
    return this.http.get<CurrentMonthPaymentResponse[]>(`${this.apiBaseUrl}/membresia/mis-pagos/mes-actual`);
  }

  getMyPayments(): Observable<CurrentMonthPaymentResponse[]> {
    return this.http.get<CurrentMonthPaymentResponse[]>(`${this.apiBaseUrl}/membresia/mis-pagos`);
  }

  getMyMembership(): Observable<UserMembresiaResponse | null> {
    return this.http.get<UserMembresiaResponse | null>(`${this.apiBaseUrl}/membresia/mi-membresia`);
  }

  getMyMemberships(): Observable<UserMembresiaResponse[]> {
    return this.http.get<UserMembresiaResponse[]>(`${this.apiBaseUrl}/membresia/mis-membresias`);
  }

  getPaymentsByDateRange(desde: string, hasta: string): Observable<{
    id: number;
    userId: number | null;
    createdAt: string;
    membresiaId: number | null;
    membresiaNombre: string;
    tipoMembresiaNombre: string | null;
    costo: number | null;
  }[]> {
    const params = `desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`;
    return this.http.get<any[]>(`${this.apiBaseUrl}/membresia/pagos/rango?${params}`);
  }

  getCurrentMonthReportMetrics(): Observable<CurrentMonthReportMetricsResponse> {
    return this.http.get<CurrentMonthReportMetricsResponse>(`${this.apiBaseUrl}/membresia/reporte/metricas-mes-actual`);
  }

  getAllMemberships(): Observable<Membresia[]> {
    return this.http.get<Membresia[]>(`${this.apiBaseUrl}/membresia`);
  }

  getAllMembershipTypes(): Observable<TipoMembresia[]> {
    return this.http.get<TipoMembresia[]>(`${this.apiBaseUrl}/membresia/tipos`);
  }

  assignMembership(membresiaId: number): Observable<UserMembresiaResponse> {
    return this.http.post<UserMembresiaResponse>(`${this.apiBaseUrl}/membresia/asignar`, { membresiaId });
  }

  createMembership(payload: {
    nombre: string;
    descripcion?: string;
    dias: string;
    costo: number;
    tipoMembresiaId: number;
  }): Observable<Membresia> {
    return this.http.post<Membresia>(`${this.apiBaseUrl}/membresia`, payload);
  }

  updateMembership(id: number, payload: {
    nombre: string;
    descripcion?: string;
    dias: string;
    costo: number;
    tipoMembresiaId: number;
  }): Observable<Membresia> {
    return this.http.patch<Membresia>(`${this.apiBaseUrl}/membresia/${id}`, payload);
  }

  deleteMembership(id: number): Observable<{ message: string; id: number }> {
    return this.http.delete<{ message: string; id: number }>(`${this.apiBaseUrl}/membresia/${id}`);
  }
}
