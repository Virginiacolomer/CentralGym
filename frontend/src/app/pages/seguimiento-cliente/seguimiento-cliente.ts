import { Component } from '@angular/core';
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
  templateUrl: './seguimiento-cliente.html',
  styleUrls: ['./seguimiento-cliente.css'],
})
export class SeguimientoCliente {
  readonly gridRows = [8, 18, 28, 38, 48, 58];

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