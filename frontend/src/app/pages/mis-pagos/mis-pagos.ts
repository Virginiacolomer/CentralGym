import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';

type PaymentStatus = 'upToDate' | 'dueSoon' | 'overdue';

type PaymentStatusConfig = {
  label: string;
  detail: string;
  nextPayment: string;
};

@Component({
  
  standalone: true,
  imports: [RouterLink, PageHeaderCompactComponent, PageBgComponent],
  templateUrl: './mis-pagos.html',
  styleUrl: './mis-pagos.css',
})
export class MisPagos {
  currentStatus: PaymentStatus = 'upToDate';

  private readonly statusConfig: Record<PaymentStatus, PaymentStatusConfig> = {
    upToDate: {
      label: 'Cuota al dia',
      detail: 'Tu membresia esta activa hasta el 30 de abril',
      nextPayment: '1 de mayo',
    },
    dueSoon: {
      label: 'Vence pronto',
      detail: 'Tu membresia vence en los proximos dias',
      nextPayment: '3 dias',
    },
    overdue: {
      label: 'Pago vencido',
      detail: 'Tu membresia se encuentra pendiente de renovacion',
      nextPayment: 'Pendiente',
    },
  };

  get status(): PaymentStatusConfig {
    return this.statusConfig[this.currentStatus];
  }
}

