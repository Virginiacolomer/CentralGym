import { Component } from '@angular/core';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';

type PendingAccount = {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
};

@Component({
  standalone: true,
  imports: [PageHeaderCompactComponent, PageBgComponent],
  templateUrl: './alta-usuarios.html',
  styleUrl: './alta-usuarios.css',
})
export class AltaUsuarios {
  pendingAccounts: PendingAccount[] = [
    { id: 1, firstName: 'Melina', lastName: 'Suarez', dni: '44231012' },
    { id: 2, firstName: 'Tomas', lastName: 'Luna', dni: '41980773' },
    { id: 3, firstName: 'Ariadna', lastName: 'Peralta', dni: '43650421' },
    { id: 4, firstName: 'Bautista', lastName: 'Flores', dni: '45411872' },
    { id: 5, firstName: 'Valeria', lastName: 'Sanchez', dni: '40811539' },
  ];

  acceptAccount(accountId: number): void {
    this.pendingAccounts = this.pendingAccounts.filter((account) => account.id !== accountId);
  }

  deleteAccount(accountId: number): void {
    this.pendingAccounts = this.pendingAccounts.filter((account) => account.id !== accountId);
  }
}
