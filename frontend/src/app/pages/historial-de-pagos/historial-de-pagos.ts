import { Component } from '@angular/core';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';

type PaymentHistoryRow = {
  month: string;
  status: string;
};

@Component({
  
  standalone: true,
  imports: [PageHeaderCompactComponent, PageBgComponent],
  templateUrl: './historial-de-pagos.html',
  styleUrl: './historial-de-pagos.css',
})
export class HistorialDePagos {
  paymentHistory: PaymentHistoryRow[] = [
    { month: 'Febrero', status: 'Pagado' },
    { month: 'Marzo', status: 'Pagado' },
    { month: 'Abril', status: 'Pagado' },
  ];
}

