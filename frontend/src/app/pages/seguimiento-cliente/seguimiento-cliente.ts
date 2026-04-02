import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';
import { AuthStateService } from '../../core/services/auth-state.service';
import { SeguimientoApiService, SeguimientoTestItem } from '../../core/services/seguimiento-api.service';

type MonthlyValue = {
  month: string;
  value: number;
};

type MetricCard = {
  id: number;
  key: string;
  title: string;
  unit: string;
  values: MonthlyValue[];
};

type TrendDot = {
  key: string;
  month: string;
  x: number;
  y: number;
  value: number;
};

@Component({
  standalone: true,
  imports: [PageHeaderCompactComponent, PageBgComponent],
  templateUrl: './seguimiento-cliente.html',
  styleUrls: ['./seguimiento-cliente.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeguimientoCliente implements OnInit {
  private readonly authStateService = inject(AuthStateService);
  private readonly seguimientoApiService = inject(SeguimientoApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly gridRows = [8, 18, 28, 38, 48, 58];
  statusMessage = '';
  isLoading = false;

  metrics: MetricCard[] = [];

  ngOnInit(): void {
    const userId = Number(this.authStateService.getCurrentUser()?.id);

    if (!Number.isFinite(userId) || userId <= 0) {
      this.statusMessage = 'No se pudo identificar al usuario para cargar el seguimiento.';
      this.metrics = [];
      this.cdr.markForCheck();
      return;
    }

    this.loadTests(userId);
  }

  private loadTests(userId: number): void {
    this.isLoading = true;
    this.statusMessage = '';
    this.metrics = [];
    this.cdr.markForCheck();

    this.seguimientoApiService
      .getTestsByUserId(userId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (tests) => {
          this.metrics = tests.map((test) => this.mapTestToMetric(test));

          if (this.metrics.length === 0) {
            this.statusMessage = 'No hay test asociados al usuario.';
          }

          this.cdr.markForCheck();
        },
        error: () => {
          this.metrics = [];
          this.statusMessage = 'No se pudieron cargar los tests del usuario.';
          this.cdr.markForCheck();
        },
      });
  }

  private mapTestToMetric(test: SeguimientoTestItem): MetricCard {
    const monthlyValues = Array.isArray(test.valoresMensuales) ? test.valoresMensuales : [];
    return {
      id: test.id,
      key: `test-${test.id}`,
      title: test.nombre,
      unit: test.unidad ?? '',
      values: monthlyValues.map((value) => ({
        month: value.mes,
        value: Number(value.valor),
      })),
    };
  }

  getGridColumns(totalPoints: number): number[] {
    return Array.from({ length: Math.max(totalPoints, 2) }, (_, index) => this.getPointX(index, Math.max(totalPoints, 2)));
  }

  getTrendPath(values: MonthlyValue[]): string {
    if (values.length === 0) {
      return '';
    }

    return values
      .map((point, index) => `${this.getPointX(index, values.length)},${this.getPointY(values, point.value)}`)
      .join(' ');
  }

  getTrendDots(values: MonthlyValue[]): TrendDot[] {
    return values.map((point, index) => ({
      key: `${point.month}-${index}-${point.value}`,
      month: point.month,
      x: this.getPointX(index, values.length),
      y: this.getPointY(values, point.value),
      value: point.value,
    }));
  }

  formatValue(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  private getPointX(index: number, totalPoints: number): number {
    if (totalPoints <= 1) {
      return 50;
    }

    const chartLeft = 8;
    const chartRight = 92;
    return chartLeft + (index * (chartRight - chartLeft)) / (totalPoints - 1);
  }

  private getPointY(values: MonthlyValue[], value: number): number {
    const minValue = Math.min(...values.map((item) => item.value));
    const maxValue = Math.max(...values.map((item) => item.value));

    if (maxValue === minValue) {
      return 33;
    }

    const chartTop = 8;
    const chartBottom = 56;
    const normalized = (value - minValue) / (maxValue - minValue);
    return chartBottom - normalized * (chartBottom - chartTop);
  }
}