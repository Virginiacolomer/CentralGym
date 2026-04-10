import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { PageBgComponent } from '../../shared/page-bg/page-bg';
import { PageHeaderComponent } from '../../shared/page-header/page-header';
import { Membresia, MembresiaApiService } from '../../core/services/membresia-api.service';

@Component({
  standalone: true,
  imports: [PageBgComponent, PageHeaderComponent],
  templateUrl: './coach-nutricion-moderna.html',
  styleUrl: './coach-nutricion-moderna.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoachNutricionModerna implements OnInit {
  private readonly membresiaApiService = inject(MembresiaApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly whatsappPhone = '5493534295437';

  memberships: Membresia[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.membresiaApiService.getAllMemberships().subscribe({
      next: (memberships) => {
        const nutritionMemberships = memberships.filter((membership) => this.isNutritionMembership(membership));

        console.log('[CoachNutricion] total recibidas:', memberships.length);
        console.log('[CoachNutricion] total nutricion:', nutritionMemberships.length);

        this.memberships = nutritionMemberships;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('[CoachNutricion] error al cargar membresias:', error);
        this.memberships = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  formatAmount(amount: number): string {
    return `$${amount.toLocaleString('es-AR')}`;
  }

  getWhatsAppHref(membership: Membresia): string {
    const membershipName = membership.nombre?.trim() || 'membresia nutricional';
    const message = `Hola! Me interesa la membresia de nutricion "${membershipName}". Quiero recibir mas informacion.`;
    return `https://wa.me/${this.whatsappPhone}?text=${encodeURIComponent(message)}`;
  }

  getMembershipDescription(membership: Membresia): string {
    const description = membership.descripcion?.trim();
    if (description) {
      return description;
    }

    return 'Plan nutricional personalizado';
  }

  private isNutritionMembership(membership: Membresia): boolean {
    const typeName = String(membership.tipoMembresia?.nombre ?? '').trim().toUpperCase();
    return typeName.includes('NUTRICION');
  }
}
