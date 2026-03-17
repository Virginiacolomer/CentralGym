import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';

type UserPlanRow = {
  firstName: string;
  lastName: string;
  dni: string;
};

@Component({
  
  standalone: true,
  imports: [RouterLink, PageHeaderCompactComponent, PageBgComponent],
  templateUrl: './asignar-plan.html',
  styleUrl: './asignar-plan.css',
})
export class AsignarPlan {
  filterTerm = '';

  users: UserPlanRow[] = [
    { firstName: 'Maria Virginia', lastName: 'Colomer Prevotel', dni: '45700085' },
    { firstName: 'Juan Pablo', lastName: 'Lopez', dni: '12345689' },
    { firstName: 'Sandra', lastName: 'Herrera', dni: '98564785' },
    { firstName: 'Pedro', lastName: 'Gutierrez', dni: '64523154' },
    { firstName: 'Lautaro', lastName: 'Gimenez', dni: '40123789' },
    { firstName: 'Camila', lastName: 'Roldan', dni: '39222881' },
    { firstName: 'Micaela', lastName: 'Ferreyra', dni: '41336210' },
    { firstName: 'Andres', lastName: 'Vera', dni: '36774001' },
    { firstName: 'Luciana', lastName: 'Correa', dni: '42876093' },
    { firstName: 'Nicolas', lastName: 'Arce', dni: '37650444' },
    { firstName: 'Rocio', lastName: 'Montes', dni: '42999003' },
    { firstName: 'Sofia', lastName: 'Leguizamon', dni: '44122877' },
    { firstName: 'Thiago', lastName: 'Molina', dni: '45890812' },
    { firstName: 'Aylin', lastName: 'Sosa', dni: '44777120' },
    { firstName: 'Agustin', lastName: 'Palacios', dni: '38990345' },
    { firstName: 'Valentina', lastName: 'Caceres', dni: '43678111' },
    { firstName: 'Bruno', lastName: 'Ramos', dni: '40228974' },
    { firstName: 'Milagros', lastName: 'Bustamante', dni: '44989002' },
    { firstName: 'Renzo', lastName: 'Cruz', dni: '39557100' },
    { firstName: 'Karen', lastName: 'Diaz', dni: '41773492' },
    { firstName: 'Ezequiel', lastName: 'Pereyra', dni: '38651002' },
    { firstName: 'Julieta', lastName: 'Dominguez', dni: '43219870' },
    { firstName: 'Franco', lastName: 'Silva', dni: '40444971' },
    { firstName: 'Noelia', lastName: 'Mendez', dni: '42331145' },
  ];

  onFilterInput(value: string): void {
    this.filterTerm = value;
  }

  get filteredUsers(): UserPlanRow[] {
    const normalizedQuery = this.normalizeText(this.filterTerm);

    if (!normalizedQuery) {
      return this.users;
    }

    return this.users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`;
      return (
        this.normalizeText(user.firstName).includes(normalizedQuery) ||
        this.normalizeText(user.lastName).includes(normalizedQuery) ||
        this.normalizeText(fullName).includes(normalizedQuery) ||
        this.normalizeText(user.dni).includes(normalizedQuery)
      );
    });
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}

