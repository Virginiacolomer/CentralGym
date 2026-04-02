import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';
import { CurrentMonthPaymentResponse, MembresiaApiService } from '../../core/services/membresia-api.service';

type PaymentStatus = 'upToDate' | 'pending';

type PaymentStatusConfig = {
  label: string;
};

type CurrentMonthPaymentItem = {
  id: number;
  monthLabel: string;
  membershipName: string;
  membershipType: string | null;
  createdAtLabel: string;
  amountLabel: string;
};

@Component({
  selector: 'app-mis-pagos',
  standalone: true,
  imports: [RouterLink, PageHeaderCompactComponent, PageBgComponent],
  templateUrl: './mis-pagos.html',
  styleUrl: './mis-pagos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisPagos implements OnInit {
  currentStatus: PaymentStatus = 'pending';
  currentMonthPayments: CurrentMonthPaymentItem[] = [];
  paymentsLoadError = '';
  readonly currentMonthLabel = this.formatMonthLabel(new Date().getMonth() + 1);
  private readonly membresiaService = inject(MembresiaApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly statusConfig: Record<PaymentStatus, PaymentStatusConfig> = {
    upToDate: {
      label: 'Cuota al dia',
    },
    pending: {
      label: 'Pendiente de pago',
    },
  };

  get status(): PaymentStatusConfig {
    return this.statusConfig[this.currentStatus];
  }

  get statusDetail(): string {
    if (this.currentStatus === 'upToDate') {
      const paymentCount = this.currentMonthPayments.length;
      return paymentCount > 1
        ? `Se registraron ${paymentCount} pagos para ${this.currentMonthLabel}.`
        : `Se registro un pago para ${this.currentMonthLabel}.`;
    }

    return 'Regularice su situación con el entrenador (membresía o seguimiento no abonados)';
  }

  get nextPaymentLabel(): string {
    if (this.currentStatus === 'pending') {
      return `Antes del 10 de ${this.currentMonthLabel}`;
    }

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return `1 ${this.formatMonthLabel(nextMonth.getMonth() + 1)}`;
  }

  ngOnInit(): void {
    this.membresiaService.getMyPaymentStatus().subscribe({
      next: (response) => {
        this.currentStatus = response.isPaymentUpToDate === true ? 'upToDate' : 'pending';
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading payment status:', err);
        this.currentStatus = 'pending';
        this.cdr.markForCheck();
      }
    });

    this.membresiaService.getMyCurrentMonthPayments().subscribe({
      next: (payments) => {
        this.paymentsLoadError = '';
        this.currentMonthPayments = payments.map((payment) => this.mapPayment(payment));
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading current month payments:', err);
        this.paymentsLoadError = 'No se pudieron cargar los pagos del mes actual.';
        this.currentMonthPayments = [];
        this.cdr.markForCheck();
      }
    });
  }

  private mapPayment(payment: CurrentMonthPaymentResponse): CurrentMonthPaymentItem {
    return {
      id: payment.id,
      monthLabel: this.formatMonthLabel(payment.mes),
      membershipName: payment.membresiaNombre,
      membershipType: payment.tipoMembresiaNombre,
      createdAtLabel: this.formatCreatedAt(payment.createdAt),
      amountLabel: this.formatCurrency(payment.costo),
    };
  }

  private formatMonthLabel(monthNumber: number): string {
    return new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(new Date(2026, monthNumber - 1, 1));
  }

  private formatCurrency(amount: number | null): string {
    if (amount === null) {
      return 'Monto no disponible';
    }

    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private formatCreatedAt(createdAt: string): string {
    const parsedDate = new Date(createdAt);
    if (Number.isNaN(parsedDate.getTime())) {
      return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(parsedDate);
  }
}

