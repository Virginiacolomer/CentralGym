import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';

interface MembershipOption {
  id: number;
  name: string;
  draftName: string;
  amount: number;
  draftAmount: string;
  frequency: number;
  draftFrequency: string;
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
    { id: 1, name: 'PASE LIBRE', draftName: 'PASE LIBRE', amount: 55000, draftAmount: '55000', frequency: 7, draftFrequency: '7', isEditing: false },
    { id: 2, name: '2 X SEMANA', draftName: '2 X SEMANA', amount: 50000, draftAmount: '50000', frequency: 2, draftFrequency: '2', isEditing: false },
    { id: 3, name: '3 X SEMANA', draftName: '3 X SEMANA', amount: 40000, draftAmount: '40000', frequency: 3, draftFrequency: '3', isEditing: false },
  ];

  private nextId = 4;

  startEditing(id: number): void {
    const membership = this.memberships.find((item) => item.id === id);
    if (!membership) {
      return;
    }

    membership.isEditing = true;
    membership.draftName = membership.name;
    membership.draftAmount = String(membership.amount);
    membership.draftFrequency = String(membership.frequency);
  }

  saveMembership(id: number): void {
    const membership = this.memberships.find((item) => item.id === id);
    if (!membership) {
      return;
    }

    if (membership.draftName.trim()) {
      membership.name = membership.draftName.trim();
    }

    const parsedAmount = this.parseAmount(membership.draftAmount);
    if (parsedAmount !== null) {
      membership.amount = parsedAmount;
    }

    const parsedFrequency = this.parseDays(membership.draftFrequency);
    if (parsedFrequency !== null) {
      membership.frequency = parsedFrequency;
    }

    membership.isEditing = false;
    membership.draftName = membership.name;
    membership.draftAmount = String(membership.amount);
    membership.draftFrequency = String(membership.frequency);
  }

  addNewMembership(): void {
    const newMembership: MembershipOption = {
      id: this.nextId++,
      name: '',
      draftName: '',
      amount: 0,
      draftAmount: '0',
      frequency: 1,
      draftFrequency: '1',
      isEditing: true,
    };

    this.memberships = [...this.memberships, newMembership];
  }

  deleteMembership(id: number): void {
    this.memberships = this.memberships.filter((membership) => membership.id !== id);
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

  private parseDays(input: string): number | null {
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

