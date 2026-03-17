import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';

type MembershipOption = {
  id: string;
  name: string;
  price: string;
  note: string;
};

@Component({
  
  standalone: true,
  imports: [RouterLink, PageHeaderCompactComponent, PageBgComponent],
  templateUrl: './cambiar-membresia.html',
  styleUrl: './cambiar-membresia.css',
})
export class CambiarMembresia {
  options: MembershipOption[] = [
    {
      id: 'pase-libre',
      name: 'Mensual - Pase libre',
      price: '$55.000',
      note: 'Acceso sin limite semanal',
    },
    {
      id: 'dos-veces',
      name: 'Mensual - 2 veces por semana',
      price: '$40.000',
      note: 'Ideal para rutina intermedia',
    },
  ];

  selectedOptionId = this.options[0].id;

  selectOption(optionId: string): void {
    this.selectedOptionId = optionId;
  }
}

