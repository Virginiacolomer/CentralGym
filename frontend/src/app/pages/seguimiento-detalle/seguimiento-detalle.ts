import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';

type MonthlyValue = {
  month: string;
  value: number;
};

type MetricCard = {
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
  templateUrl: './seguimiento-detalle.html',
  styleUrl: './seguimiento-detalle.css',
})
export class SeguimientoDetalle {
  personName = 'Cliente';
  readonly gridRows = [8, 18, 28, 38, 48, 58];
  private customMetricCounter = 1;

  metrics: MetricCard[] = [
    {
      key: 'peso',
      title: 'Evolucion del peso',
      unit: 'kg',
      values: [
        { month: 'Ene', value: 82 },
        { month: 'Feb', value: 80.8 },
        { month: 'Mar', value: 79.9 },
      ],
    },
    {
      key: 'imc',
      title: 'Evolucion del IMC',
      unit: '',
      values: [
        { month: 'Ene', value: 26.1 },
        { month: 'Feb', value: 25.6 },
        { month: 'Mar', value: 25.1 },
      ],
    },
    {
      key: 'salto',
      title: 'Altura de salto',
      unit: 'cm',
      values: [
        { month: 'Ene', value: 34 },
        { month: 'Feb', value: 36 },
        { month: 'Mar', value: 38 },
      ],
    },
    {
      key: 'fuerza',
      title: 'Fuerza tren inferior',
      unit: 'kg',
      values: [
        { month: 'Ene', value: 70 },
        { month: 'Feb', value: 74 },
        { month: 'Mar', value: 78 },
      ],
    },
  ];

  private readonly monthOrder = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  constructor(private readonly route: ActivatedRoute) {
    this.route.queryParamMap.subscribe((params) => {
      const requestedName = params.get('name');
      if (requestedName && requestedName.trim()) {
        this.personName = requestedName.trim();
      }
    });
  }

  addMonthlyValue(metricKey: string): void {
    const metric = this.metrics.find((item) => item.key === metricKey);
    if (!metric) {
      return;
    }

    const lastMonth = metric.values[metric.values.length - 1]?.month;
    const nextMonth = this.getNextMonth(lastMonth);
    const promptLabel = metric.unit ? `${metric.title} (${metric.unit})` : metric.title;

    if (typeof window === 'undefined') {
      return;
    }

    const input = window.prompt(`Agregar valor de ${promptLabel} para ${nextMonth}:`);
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

    metric.values = [...metric.values, { month: nextMonth, value: Number(numericValue.toFixed(1)) }];
    this.metrics = [...this.metrics];
  }

  addCustomMetric(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const inputTitle = window.prompt('Titulo del nuevo grafico:');
    if (inputTitle === null) {
      return;
    }

    const title = inputTitle.trim();
    if (!title) {
      return;
    }

    const inputUnit = window.prompt('Unidad de medida (ej: kg, mt, gr):');
    if (inputUnit === null) {
      return;
    }

    const unit = inputUnit.trim();
    if (!unit) {
      return;
    }

    const normalizedKey = this.normalizeKey(title);
    const uniqueKey = this.buildUniqueMetricKey(normalizedKey || `custom-${this.customMetricCounter++}`);

    const newMetric: MetricCard = {
      key: uniqueKey,
      title,
      unit,
      values: [],
    };

    this.metrics = [...this.metrics, newMetric];
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

  private getNextMonth(lastMonth: string | undefined): string {
    if (!lastMonth) {
      return this.monthOrder[0];
    }

    const currentIndex = this.monthOrder.indexOf(lastMonth);
    if (currentIndex < 0) {
      return this.monthOrder[0];
    }

    return this.monthOrder[(currentIndex + 1) % this.monthOrder.length];
  }

  private normalizeKey(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private buildUniqueMetricKey(baseKey: string): string {
    let candidate = baseKey;
    let suffix = 1;

    while (this.metrics.some((metric) => metric.key === candidate)) {
      candidate = `${baseKey}-${suffix++}`;
    }

    return candidate;
  }
}