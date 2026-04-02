import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SeguimientoValorMensual {
  mes: string;
  valor: number;
}

export interface SeguimientoTestItem {
  id: number;
  nombre: string;
  unidadMedidaId: number | null;
  unidad: string;
  valoresMensuales: SeguimientoValorMensual[];
}

export interface SeguimientoUnidadMedida {
  id: number;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class SeguimientoApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

  getTestsByUserId(userId: number): Observable<SeguimientoTestItem[]> {
    return this.http.get<SeguimientoTestItem[]>(`${this.apiBaseUrl}/seguimiento/usuario/${userId}/tests`);
  }

  getUnidadesMedida(): Observable<SeguimientoUnidadMedida[]> {
    return this.http.get<SeguimientoUnidadMedida[]>(`${this.apiBaseUrl}/seguimiento/unidades-medida`);
  }

  createTestForUser(userId: number, payload: { nombre: string; unidadMedidaId: number }): Observable<SeguimientoTestItem> {
    return this.http.post<SeguimientoTestItem>(`${this.apiBaseUrl}/seguimiento/usuario/${userId}/tests`, payload);
  }

  addMonthlyValue(testId: number, payload: { mes: string; valor: number }): Observable<SeguimientoTestItem> {
    return this.http.post<SeguimientoTestItem>(`${this.apiBaseUrl}/seguimiento/tests/${testId}/valores`, payload);
  }
}
