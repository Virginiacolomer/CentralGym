import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';
import { Membresia, MembresiaApiService, TipoMembresia } from '../../core/services/membresia-api.service';

interface MembershipOption {
  id: number | null;
  name: string;
  draftName: string;
  description: string;
  draftDescription: string;
  amount: number;
  draftAmount: string;
  frequency: string;
  draftFrequency: string;
  typeId: number | null;
  draftTypeId: number | null;
  isEditing: boolean;
  isNew: boolean;
  isSaving: boolean;
  isDeleting: boolean;
}

@Component({
  standalone: true,
  imports: [PageHeaderCompactComponent, PageBgComponent, FormsModule],
  templateUrl: './gestion-membresias.html',
  styleUrl: './gestion-membresias.css',
})
export class GestionMembresias implements OnInit {
  private readonly membresiaApiService = inject(MembresiaApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  memberships: MembershipOption[] = [];
  membershipTypes: TipoMembresia[] = [];
  isLoading = false;
  statusMessage = '';

  ngOnInit(): void {
    this.loadMembershipTypes();
    this.loadMemberships();
  }

  startEditing(id: number): void {
    const membership = this.memberships.find((item) => item.id === id);
    if (!membership) {
      return;
    }

    membership.isEditing = true;
    membership.draftName = membership.name;
    membership.draftDescription = membership.description;
    membership.draftAmount = String(membership.amount);
    membership.draftFrequency = membership.frequency;
    membership.draftTypeId = membership.typeId;

    this.resizeDescriptionTextareas();
  }

  saveMembership(id: number | null): void {
    const membership = this.memberships.find((item) => item.id === id);
    if (!membership) {
      return;
    }

    const normalizedName = membership.draftName.trim();
    const normalizedDescription = membership.draftDescription.trim();
    const parsedAmount = this.parseAmount(membership.draftAmount);
    const parsedFrequency = this.parseFrequencyText(membership.draftFrequency);
    const parsedTypeId = this.parseTypeId(membership.draftTypeId);

    if (!normalizedName) {
      window.alert('Debes ingresar un nombre para la membresia.');
      return;
    }

    if (parsedAmount === null) {
      window.alert('Debes ingresar un costo valido para la membresia.');
      return;
    }

    if (parsedFrequency === null) {
      window.alert('Debes ingresar una frecuencia valida para la membresia.');
      return;
    }

    if (parsedTypeId === null) {
      window.alert('Debes seleccionar un tipo de membresia.');
      return;
    }

    const payload = {
      nombre: normalizedName,
      descripcion: normalizedDescription || undefined,
      costo: parsedAmount,
      dias: parsedFrequency,
      tipoMembresiaId: parsedTypeId,
    };

    membership.isSaving = true;
    this.cdr.detectChanges();

    const request$ = membership.isNew
      ? this.membresiaApiService.createMembership(payload)
      : this.membresiaApiService.updateMembership(id!, payload);

    request$
      .pipe(
        finalize(() => {
          membership.isSaving = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.statusMessage = membership.isNew
            ? 'Membresia creada correctamente.'
            : 'Membresia actualizada correctamente.';
          this.loadMemberships();
        },
        error: (error) => {
          window.alert(this.getErrorMessage(error, 'No se pudo guardar la membresia.'));
        },
      });
  }

  addNewMembership(): void {
    if (this.memberships.some((membership) => membership.isNew && membership.isEditing)) {
      return;
    }

    const newMembership: MembershipOption = {
      id: null,
      name: '',
      draftName: '',
      description: '',
      draftDescription: '',
      amount: 0,
      draftAmount: '0',
      frequency: '1 SEMANA',
      draftFrequency: '1 SEMANA',
      typeId: this.membershipTypes[0]?.id ?? null,
      draftTypeId: this.membershipTypes[0]?.id ?? null,
      isEditing: true,
      isNew: true,
      isSaving: false,
      isDeleting: false,
    };

    this.memberships = [newMembership, ...this.memberships];
    this.resizeDescriptionTextareas();
  }

  autoResizeDescription(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement | null;
    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  cancelEditing(id: number | null): void {
    const membership = this.memberships.find((item) => item.id === id);
    if (!membership) {
      if (id === null) {
        this.memberships = this.memberships.filter((item) => item.id !== null);
      }
      return;
    }

    if (membership.isNew) {
      this.memberships = this.memberships.filter((item) => item !== membership);
      return;
    }

    membership.isEditing = false;
    membership.draftName = membership.name;
    membership.draftDescription = membership.description;
    membership.draftAmount = String(membership.amount);
    membership.draftFrequency = membership.frequency;
    membership.draftTypeId = membership.typeId;
  }

  deleteMembership(id: number): void {
    const membership = this.memberships.find((item) => item.id === id);
    if (!membership || membership.isDeleting) {
      return;
    }

    const confirmed = window.confirm(`¿Seguro que deseas eliminar la membresia ${membership.name}?`);
    if (!confirmed) {
      return;
    }

    membership.isDeleting = true;
    this.cdr.detectChanges();

    this.membresiaApiService
      .deleteMembership(id)
      .pipe(
        finalize(() => {
          membership.isDeleting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.statusMessage = 'Membresia eliminada correctamente.';
          this.loadMemberships();
        },
        error: (error) => {
          window.alert(this.getErrorMessage(error, 'No se pudo eliminar la membresia.'));
        },
      });
  }

  formatAmount(amount: number): string {
    return `$${amount.toLocaleString('es-AR')}`;
  }

  getTypeName(typeId: number | null): string {
    return this.membershipTypes.find((type) => type.id === typeId)?.nombre ?? 'Sin tipo';
  }

  trackMembership(_: number, membership: MembershipOption): number | string {
    return membership.id ?? `new-${membership.draftName}-${membership.draftDescription}-${membership.draftAmount}`;
  }

  private loadMemberships(): void {
    this.isLoading = true;
    this.statusMessage = '';
    this.cdr.markForCheck();

    this.membresiaApiService
      .getAllMemberships()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (memberships) => {
          this.memberships = memberships.map((membership) => this.mapMembership(membership));
          if (this.memberships.length === 0) {
            this.statusMessage = 'No hay membresias cargadas.';
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.statusMessage = this.getErrorMessage(error, 'No se pudieron cargar las membresias.');
          this.memberships = [];
          this.cdr.detectChanges();
        },
      });
  }

  private loadMembershipTypes(): void {
    this.membresiaApiService.getAllMembershipTypes().subscribe({
      next: (types) => {
        this.membershipTypes = types;
        this.cdr.detectChanges();
      },
      error: () => {
        this.membershipTypes = [];
        this.cdr.detectChanges();
      },
    });
  }

  private resizeDescriptionTextareas(): void {
    queueMicrotask(() => {
      document.querySelectorAll<HTMLTextAreaElement>('.description-input').forEach((textarea) => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      });
    });
  }

  private mapMembership(membership: Membresia): MembershipOption {
    return {
      id: membership.id,
      name: membership.nombre,
      draftName: membership.nombre,
      description: membership.descripcion?.trim() || '',
      draftDescription: membership.descripcion?.trim() || '',
      amount: membership.costo,
      draftAmount: String(membership.costo),
      frequency: membership.dias,
      draftFrequency: membership.dias,
      typeId: membership.tipoMembresia?.id ?? null,
      draftTypeId: membership.tipoMembresia?.id ?? null,
      isEditing: false,
      isNew: false,
      isSaving: false,
      isDeleting: false,
    };
  }

  private parseAmount(input: string): number | null {
    const cleanInput = input.replace(/[^0-9]/g, '');
    if (!cleanInput) {
      return null;
    }

    const numericValue = Number(cleanInput);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return null;
    }

    return Math.round(numericValue);
  }

  private parseFrequencyText(input: string): string | null {
    const cleanInput = input.trim();
    if (!cleanInput) {
      return null;
    }

    return cleanInput;
  }

  private parseTypeId(input: number | null): number | null {
    if (input === null || !Number.isFinite(input) || input <= 0) {
      return null;
    }

    return Math.round(input);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage = error.error?.message;
      if (Array.isArray(backendMessage) && backendMessage.length > 0) {
        return backendMessage[0];
      }

      if (typeof backendMessage === 'string' && backendMessage.trim()) {
        return backendMessage;
      }
    }

    return fallback;
  }
}

