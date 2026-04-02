import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { RouterLink } from '@angular/router';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';
import { ActiveClientUserItem, UsersApiService } from '../../core/services/users-api.service';
import { Membresia, MembresiaApiService } from '../../core/services/membresia-api.service';

type PaymentState = 'alDia' | 'cuotaPendiente';

type FollowUpClient = {
  id: number;
  fullName: string;
  dni: string;
  membershipId: number | null;
  paymentState: PaymentState;
};

type FollowUpCandidate = {
  id: number;
  fullName: string;
  dni: string;
  currentMembership: string;
};

@Component({
  standalone: true,
  imports: [PageHeaderCompactComponent, PageBgComponent, RouterLink, FormsModule],
  templateUrl: './seguimiento-personalizado.html',
  styleUrls: ['./seguimiento-personalizado.css'],
})
export class SeguimientoPersonalizado implements OnInit {
  private readonly usersApiService = inject(UsersApiService);
  private readonly membresiaApiService = inject(MembresiaApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly seguimientoMembershipTypeId = 2;

  clients: FollowUpClient[] = [];
  candidateUsers: FollowUpCandidate[] = [];
  seguimientoMemberships: Membresia[] = [];

  isLoading = false;
  isAddingUser = false;
  isLoadingMemberships = false;
  isAddPanelOpen = false;
  selectedSeguimientoMembershipId: number | null = null;
  filterTerm = '';
  candidateSearch = '';
  assigningUserId: number | null = null;
  statusMessage = '';
  addStatusMessage = '';

  ngOnInit(): void {
    this.loadSeguimientoMemberships();
    this.loadSeguimientoClients();
  }

  get filteredCandidates(): FollowUpCandidate[] {
    const query = this.normalize(this.candidateSearch);
    if (!query) {
      return this.candidateUsers;
    }

    return this.candidateUsers.filter((candidate) => {
      return (
        this.normalize(candidate.fullName).includes(query) ||
        this.normalize(candidate.dni).includes(query)
      );
    });
  }

  get filteredClients(): FollowUpClient[] {
    const query = this.normalize(this.filterTerm);
    if (!query) {
      return this.clients;
    }

    return this.clients.filter((client) => {
      return (
        this.normalize(client.fullName).includes(query) ||
        this.normalize(client.dni).includes(query)
      );
    });
  }

  onFilterInput(value: string): void {
    this.filterTerm = value;
  }

  toggleAddPanel(): void {
    this.isAddPanelOpen = !this.isAddPanelOpen;
    this.addStatusMessage = '';
  }

  private loadSeguimientoClients(): void {
    this.isLoading = true;
    this.statusMessage = '';
    this.cdr.markForCheck();

    this.usersApiService
      .getClientesActivos()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (users) => {
          this.candidateUsers = users
            .filter((user) => !this.hasSeguimientoMembership(user))
            .map((user) => this.mapToCandidate(user));

          this.clients = users
            .filter((user) => this.hasSeguimientoMembership(user))
            .map((user) => this.mapToFollowUpClient(user));

          if (this.clients.length === 0) {
            this.statusMessage = 'No hay usuarios con membresia de seguimiento.';
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.clients = [];
          this.statusMessage = 'No se pudieron cargar los usuarios.';
          this.cdr.markForCheck();
        },
      });
  }

  private loadSeguimientoMemberships(): void {
    this.isLoadingMemberships = true;

    this.membresiaApiService
      .getAllMemberships()
      .pipe(
        finalize(() => {
          this.isLoadingMemberships = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (memberships) => {
          this.seguimientoMemberships = memberships.filter(
            (membership) => membership.tipoMembresia?.id === this.seguimientoMembershipTypeId
          );

          this.selectedSeguimientoMembershipId = this.seguimientoMemberships[0]?.id ?? null;
          this.cdr.markForCheck();
        },
        error: () => {
          this.seguimientoMemberships = [];
          this.selectedSeguimientoMembershipId = null;
          this.addStatusMessage = 'No se pudieron cargar las membresias de seguimiento.';
          this.cdr.markForCheck();
        },
      });
  }

  private mapToFollowUpClient(user: ActiveClientUserItem): FollowUpClient {
    const seguimientoMembership = (user.membresias ?? []).find(
      (membership) => membership.tipoMembresiaId === this.seguimientoMembershipTypeId,
    );

    return {
      id: user.id,
      fullName: `${user.nombre} ${user.apellido}`,
      dni: user.dni,
      membershipId: seguimientoMembership?.membresiaId ?? null,
      paymentState: seguimientoMembership?.estadoPago ?? 'cuotaPendiente',
    };
  }

  private mapToCandidate(user: ActiveClientUserItem): FollowUpCandidate {
    return {
      id: user.id,
      fullName: `${user.nombre} ${user.apellido}`,
      dni: user.dni,
      currentMembership: user.membresia,
    };
  }

  addUserToSeguimiento(userId: number): void {
    if (!this.selectedSeguimientoMembershipId) {
      this.addStatusMessage = 'No hay membresia de seguimiento disponible para asignar.';
      return;
    }

    this.assigningUserId = userId;
    this.addStatusMessage = '';

    this.usersApiService
      .updateUserMembership(userId, this.selectedSeguimientoMembershipId)
      .pipe(
        finalize(() => {
          this.assigningUserId = null;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.addStatusMessage = 'Usuario agregado a seguimiento correctamente.';
          this.loadSeguimientoClients();
        },
        error: () => {
          this.addStatusMessage = 'No se pudo agregar el usuario a seguimiento.';
          this.cdr.markForCheck();
        },
      });
  }

  makeStatusUpToDate(clientId: number): void {
    const client = this.clients.find((item) => item.id === clientId);
    this.usersApiService.markUserPaymentUpToDate(clientId, client?.membershipId ?? null).subscribe({
      next: () => {
        this.clients = this.clients.map((client) =>
          client.id === clientId
            ? {
                ...client,
                paymentState: 'alDia',
              }
            : client
        );
        this.cdr.markForCheck();
      },
      error: () => {
        this.statusMessage = 'No se pudo actualizar el estado de pago.';
        this.cdr.markForCheck();
      },
    });
  }

  getStatusLabel(status: PaymentState): string {
    if (status === 'alDia') {
      return 'Al dia';
    }

    return 'Cuota pendiente';
  }

  private hasSeguimientoMembership(user: ActiveClientUserItem): boolean {
    return (user.membresias ?? []).some(
      (membership) => membership.tipoMembresiaId === this.seguimientoMembershipTypeId,
    );
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}