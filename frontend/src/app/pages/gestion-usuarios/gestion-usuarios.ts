import { Component } from '@angular/core';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';

type MembershipType = '3xsemana' | '2xsemana' | 'pase libre';
type PaymentState = 'alDia' | 'porVencer' | 'cuotaPendiente';

type ManagedUser = {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  paymentState: PaymentState;
  membership: MembershipType;
  editMembershipOpen: boolean;
  pendingMembership: MembershipType;
};

@Component({
  
  standalone: true,
  imports: [PageHeaderCompactComponent, PageBgComponent],
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.css',
})
export class GestionUsuarios {
  filterTerm = '';

  readonly membershipOptions: MembershipType[] = ['3xsemana', '2xsemana', 'pase libre'];

  users: ManagedUser[] = [
    this.createUser(1, 'Maria Virginia', 'Colomer Prevotel', '45700085', 'alDia', '3xsemana'),
    this.createUser(2, 'Juan Pablo', 'Lopez', '12345689', 'porVencer', '2xsemana'),
    this.createUser(3, 'Sandra', 'Herrera', '98564785', 'alDia', 'pase libre'),
    this.createUser(4, 'Pedro', 'Gutierrez', '64523154', 'cuotaPendiente', '3xsemana'),
    this.createUser(5, 'Lautaro', 'Gimenez', '40123789', 'alDia', '2xsemana'),
    this.createUser(6, 'Camila', 'Roldan', '39222881', 'porVencer', '3xsemana'),
    this.createUser(7, 'Micaela', 'Ferreyra', '41336210', 'alDia', 'pase libre'),
    this.createUser(8, 'Andres', 'Vera', '36774001', 'cuotaPendiente', '2xsemana'),
    this.createUser(9, 'Luciana', 'Correa', '42876093', 'alDia', '3xsemana'),
    this.createUser(10, 'Nicolas', 'Arce', '37650444', 'alDia', '2xsemana'),
    this.createUser(11, 'Rocio', 'Montes', '42999003', 'porVencer', 'pase libre'),
    this.createUser(12, 'Sofia', 'Leguizamon', '44122877', 'alDia', '3xsemana'),
    this.createUser(13, 'Thiago', 'Molina', '45890812', 'cuotaPendiente', '2xsemana'),
    this.createUser(14, 'Aylin', 'Sosa', '44777120', 'alDia', 'pase libre'),
    this.createUser(15, 'Agustin', 'Palacios', '38990345', 'porVencer', '3xsemana'),
    this.createUser(16, 'Valentina', 'Caceres', '43678111', 'alDia', '2xsemana'),
    this.createUser(17, 'Bruno', 'Ramos', '40228974', 'alDia', '3xsemana'),
    this.createUser(18, 'Milagros', 'Bustamante', '44989002', 'cuotaPendiente', 'pase libre'),
    this.createUser(19, 'Renzo', 'Cruz', '39557100', 'alDia', '2xsemana'),
    this.createUser(20, 'Karen', 'Diaz', '41773492', 'porVencer', '3xsemana'),
    this.createUser(21, 'Ezequiel', 'Pereyra', '38651002', 'alDia', '2xsemana'),
    this.createUser(22, 'Julieta', 'Dominguez', '43219870', 'alDia', 'pase libre'),
    this.createUser(23, 'Franco', 'Silva', '40444971', 'cuotaPendiente', '3xsemana'),
    this.createUser(24, 'Noelia', 'Mendez', '42331145', 'alDia', '2xsemana'),
    this.createUser(25, 'Gonzalo', 'Castro', '39128831', 'porVencer', 'pase libre'),
    this.createUser(26, 'Carolina', 'Campos', '44667213', 'alDia', '3xsemana'),
    this.createUser(27, 'Mateo', 'Ruiz', '43888231', 'alDia', '2xsemana'),
    this.createUser(28, 'Bianca', 'Acosta', '45111701', 'cuotaPendiente', '3xsemana'),
  ];

  onFilterInput(value: string): void {
    this.filterTerm = value;
  }

  get filteredUsers(): ManagedUser[] {
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

  makeStatusUpToDate(userId: number): void {
    this.users = this.users.map((user) =>
      user.id === userId
        ? {
            ...user,
            paymentState: 'alDia',
          }
        : user
    );
  }

  toggleMembershipEditor(userId: number): void {
    this.users = this.users.map((user) => {
      if (user.id !== userId) {
        return {
          ...user,
          editMembershipOpen: false,
          pendingMembership: user.membership,
        };
      }

      return {
        ...user,
        editMembershipOpen: !user.editMembershipOpen,
        pendingMembership: user.membership,
      };
    });
  }

  getAlternativeMemberships(user: ManagedUser): MembershipType[] {
    return this.membershipOptions.filter((option) => option !== user.membership);
  }

  setPendingMembership(userId: number, newMembership: MembershipType): void {
    this.users = this.users.map((user) =>
      user.id === userId
        ? {
            ...user,
            pendingMembership: newMembership,
          }
        : user
    );
  }

  applyMembershipChange(userId: number): void {
    this.users = this.users.map((user) =>
      user.id === userId
        ? {
            ...user,
            membership: user.pendingMembership,
            editMembershipOpen: false,
          }
        : user
    );
  }

  getStatusLabel(status: PaymentState): string {
    if (status === 'alDia') {
      return 'Al dia';
    }

    if (status === 'porVencer') {
      return 'Por vencer';
    }

    return 'Cuota pendiente';
  }

  private createUser(
    id: number,
    firstName: string,
    lastName: string,
    dni: string,
    paymentState: PaymentState,
    membership: MembershipType
  ): ManagedUser {
    return {
      id,
      firstName,
      lastName,
      dni,
      paymentState,
      membership,
      editMembershipOpen: false,
      pendingMembership: membership,
    };
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}

