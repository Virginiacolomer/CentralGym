import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';

type PaymentState = 'alDia' | 'cuotaPendiente';

type FollowUpClient = {
  id: number;
  fullName: string;
  dni: string;
  paymentState: PaymentState;
};

@Component({
  standalone: true,
  imports: [PageHeaderCompactComponent, PageBgComponent, RouterLink],
  templateUrl: './seguimiento-personalizado.html',
  styleUrls: ['./seguimiento-personalizado.css'],
})
export class SeguimientoPersonalizado {
  clients: FollowUpClient[] = [
    { id: 1, fullName: 'Maria Virginia Colomer Prevotel', dni: '45700085', paymentState: 'alDia' },
    { id: 2, fullName: 'Juan Pablo Lopez', dni: '12345689', paymentState: 'cuotaPendiente' },
    { id: 3, fullName: 'Camila Roldan', dni: '39222881', paymentState: 'alDia' },
    { id: 4, fullName: 'Bianca Acosta', dni: '45111701', paymentState: 'cuotaPendiente' },
    { id: 5, fullName: 'Sofia Leguizamon', dni: '44122877', paymentState: 'alDia' },
    { id: 6, fullName: 'Renzo Cruz', dni: '39557100', paymentState: 'cuotaPendiente' },
  ];

  makeStatusUpToDate(clientId: number): void {
    this.clients = this.clients.map((client) =>
      client.id === clientId
        ? {
            ...client,
            paymentState: 'alDia',
          }
        : client
    );
  }

  getStatusLabel(status: PaymentState): string {
    if (status === 'alDia') {
      return 'Al dia';
    }

    return 'Cuota pendiente';
  }
}