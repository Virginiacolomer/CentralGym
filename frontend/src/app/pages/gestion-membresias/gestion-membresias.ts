import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';

interface MembershipOption {
  id: number;
  name: string;
  amount: number;
  draftAmount: string;
  isEditing: boolean;
}

@Component({
  standalone: true,
  imports: [PageHeaderCompactComponent, PageBgComponent, FormsModule],
  templateUrl: './gestion-membresias.html',
  styleUrl: './gestion-membresias.css',
})
export class GestionMembresias {
  memberships: MembershipOption[] = [
    { id: 1, name: 'PASE LIBRE', amount: 55000, draftAmount: '55000', isEditing: false },
    { id: 2, name: '2 X SEMANA', amount: 50000, draftAmount: '50000', isEditing: false },
    { id: 3, name: '3 X SEMANA', amount: 40000, draftAmount: '40000', isEditing: false },
  ];

  startEditing(id: number): void {
    const membership = this.memberships.find((item) => item.id === id);
    if (!membership) {
      return;
    }

    membership.isEditing = true;
    membership.draftAmount = String(membership.amount);
  }

  saveMembership(id: number): void {
    const membership = this.memberships.find((item) => item.id === id);
    if (!membership) {
      return;
    }

    const parsedAmount = this.parseAmount(membership.draftAmount);
    if (parsedAmount !== null) {
      membership.amount = parsedAmount;
    }

    membership.isEditing = false;
    membership.draftAmount = String(membership.amount);
  }

  formatAmount(amount: number): string {
    return `$${amount.toLocaleString('es-AR')}`;
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
}

