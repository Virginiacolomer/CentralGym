import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header';
import { PageBgComponent } from '../../shared/page-bg/page-bg';
import { Membresia, MembresiaApiService } from '../../core/services/membresia-api.service';

@Component({
  selector: 'app-membresias',
  standalone: true,
  imports: [PageHeaderComponent, PageBgComponent],
  templateUrl: './membresias.html',
  styleUrl: './membresias.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Membresias implements OnInit {
  private readonly membresiaApiService = inject(MembresiaApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  memberships: Membresia[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.membresiaApiService.getAllMemberships().subscribe({
      next: (memberships) => {
        const trainingMemberships = memberships.filter((membership) => this.isTrainingMembership(membership));

        console.log('[Membresias] total recibidas:', memberships.length);
        console.log('[Membresias] total entrenamiento:', trainingMemberships.length);
        console.log(
          '[Membresias] tipos recibidos:',
          memberships.map((membership) => ({
            id: membership.id,
            nombre: membership.nombre,
            tipo: membership.tipoMembresia?.nombre ?? null,
          })),
        );

        this.memberships = trainingMemberships;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('[Membresias] error al cargar listado publico de membresias:', error);
        this.memberships = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  formatAmount(amount: number): string {
    return `$${amount.toLocaleString('es-AR')}`;
  }

  getMembershipDescription(membership: Membresia): string {
    const description = membership.descripcion?.trim();
    if (description) {
      return description;
    }

    return 'Sin descripcion';
  }

  private isTrainingMembership(membership: Membresia): boolean {
    const typeName = String(membership.tipoMembresia?.nombre ?? '').trim().toUpperCase();
    return typeName.includes('ENTRENAMIENTO');
  }

  // Referencia de tipo para evitar diagnosticos de importacion no usada en este entorno.
  protected readonly headerComponentRef = PageHeaderComponent;
}
