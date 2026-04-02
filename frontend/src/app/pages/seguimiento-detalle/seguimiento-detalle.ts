import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';
import {
  SeguimientoApiService,
  SeguimientoTestItem,
  SeguimientoUnidadMedida,
} from '../../core/services/seguimiento-api.service';

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
  imports: [PageHeaderCompactComponent, PageBgComponent, FormsModule],
  templateUrl: './seguimiento-detalle.html',
  styleUrl: './seguimiento-detalle.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeguimientoDetalle implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly seguimientoApiService = inject(SeguimientoApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  personName = 'Cliente';
  userId: number | null = null;
  isLoading = false;
  isLoadingUnits = false;
  statusMessage = '';
  unitOptions: SeguimientoUnidadMedida[] = [];
  newMetricTitle = '';
  selectedUnidadMedidaId: number | null = null;
  readonly gridRows = [8, 18, 28, 38, 48, 58];

  metrics: MetricCard[] = [];

  private readonly monthOrder = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  ngOnInit(): void {
    this.loadUnitOptions();

    this.route.queryParamMap.subscribe((params) => {
      const requestedName = params.get('name');
      if (requestedName && requestedName.trim()) {
        this.personName = requestedName.trim();
      }
    });

    this.route.paramMap.subscribe((params) => {
      const rawId = Number(params.get('id'));
      this.userId = Number.isFinite(rawId) && rawId > 0 ? rawId : null;

      if (!this.userId) {
        this.statusMessage = 'No se encontro el usuario para cargar el seguimiento.';
        this.metrics = [];
        this.cdr.markForCheck();
        return;
      }

      this.loadTests(this.userId);
    });
  }

  private loadUnitOptions(): void {
    this.isLoadingUnits = true;
    this.cdr.markForCheck();

    this.seguimientoApiService
      .getUnidadesMedida()
      .pipe(
        finalize(() => {
          this.isLoadingUnits = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (units) => {
          this.unitOptions = units;
          this.selectedUnidadMedidaId = units[0]?.id ?? null;
          this.cdr.markForCheck();
        },
        error: () => {
          this.unitOptions = [];
          this.selectedUnidadMedidaId = null;
          this.statusMessage = 'No se pudieron cargar las unidades de medida.';
          this.cdr.markForCheck();
        },
      });
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

  addMonthlyValue(metricKey: string): void {
    const metric = this.metrics.find((item) => item.key === metricKey);
    if (!metric || !this.userId) {
      return;
    }

    const currentMonth = this.getCurrentMonth();
    const promptLabel = metric.unit ? `${metric.title} (${metric.unit})` : metric.title;

    if (typeof window === 'undefined') {
      return;
    }

    const input = window.prompt(`Agregar valor de ${promptLabel} para ${currentMonth}:`);
    if (input === null) {
      return;
    }

    const normalizedInput = input.replace(',', '.').trim();
    if (!normalizedInput) {
      return;
    }

    const numericValue = Number(normalizedInput);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return;
    }

    this.seguimientoApiService
      .addMonthlyValue(metric.id, {
        mes: currentMonth,
        valor: Number(numericValue.toFixed(1)),
      })
      .subscribe({
        next: (updatedTest) => {
          const updatedMetric = this.mapTestToMetric(updatedTest);
          this.metrics = this.metrics.map((item) => (item.id === updatedMetric.id ? updatedMetric : item));
          this.cdr.markForCheck();
        },
        error: () => {
          this.statusMessage = 'No se pudo guardar el valor mensual.';
          this.cdr.markForCheck();
        },
      });
  }

  addCustomMetric(): void {
    if (!this.userId) {
      return;
    }

    const title = this.newMetricTitle.trim();
    if (!title) {
      this.statusMessage = 'Debes ingresar un nombre para el test.';
      return;
    }

    if (!this.selectedUnidadMedidaId) {
      this.statusMessage = 'Debes seleccionar una unidad de medida.';
      return;
    }

    this.seguimientoApiService
      .createTestForUser(this.userId, {
        nombre: title,
        unidadMedidaId: this.selectedUnidadMedidaId,
      })
      .subscribe({
        next: (test) => {
          const newMetric = this.mapTestToMetric(test);
          this.metrics = [...this.metrics, newMetric];
          this.newMetricTitle = '';
          this.statusMessage = '';
          this.cdr.markForCheck();
        },
        error: () => {
          this.statusMessage = 'No se pudo crear el nuevo test.';
          this.cdr.markForCheck();
        },
      });
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

  private getCurrentMonth(): string {
    return this.monthOrder[new Date().getMonth()];
  }
}