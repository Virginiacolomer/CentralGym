import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';
import { MembresiaApiService, UserMembresiaResponse } from '../../core/services/membresia-api.service';

@Component({
  
  standalone: true,
  imports: [RouterLink, PageHeaderCompactComponent, PageBgComponent],
  templateUrl: './menu-cliente.html',
  styleUrl: './menu-cliente.css',
})
export class MenuCliente {
  private readonly router = inject(Router);
  private readonly membresiaApiService = inject(MembresiaApiService);

  onSeguimientoClick(event: MouseEvent): void {
    event.preventDefault();

    this.membresiaApiService.getMyMemberships().subscribe({
      next: (memberships) => {
        if (this.hasPaidSeguimientoMembership(memberships)) {
          this.router.navigate(['/seguimiento-cliente']);
          return;
        }

        window.alert('Debes abonar la membresia SEGUIMIENTO PERSONALIZADO con tu entrenador para poder acceder a esos datos.');
      },
      error: () => {
        window.alert('Debes abonar la membresia SEGUIMIENTO PERSONALIZADO con tu entrenador para poder acceder a esos datos.');
      },
    });
  }

  private hasPaidSeguimientoMembership(memberships: UserMembresiaResponse[]): boolean {
    return memberships.some((membership) => {
      const tipo = (membership.membresia?.tipoMembresia?.nombre ?? '').toLowerCase();
      const nombreMembresia = (membership.membresia?.nombre ?? '').toLowerCase();
      const hasSeguimiento = tipo.includes('seguimiento') || nombreMembresia.includes('seguimiento');
      const estado = String(membership.estado?.nombre ?? '').toUpperCase();

      return hasSeguimiento && estado === 'AL_DIA';
    });
  }
}

