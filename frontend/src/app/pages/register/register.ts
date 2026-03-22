import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';
import { AuthApiService } from '../../core/services/auth-api.service';
import { finalize } from 'rxjs';

@Component({
  
  standalone: true,
  imports: [FormsModule, RouterLink, PageHeaderCompactComponent, PageBgComponent],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  constructor(
    private readonly authApiService: AuthApiService,
    private readonly router: Router,
  ) {}

  form = {
    email: '',
    nombre: '',
    apellido: '',
    dni: '',
    password: '',
    passwordConfirm: '',
  };

  loading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.password !== this.form.passwordConfirm) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;

    this.authApiService
      .register({
        email: this.form.email.trim().toLowerCase(),
        nombre: this.form.nombre.trim(),
        apellido: this.form.apellido.trim(),
        dni: this.form.dni.trim(),
        password: this.form.password,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Registro exitoso. Ahora podes iniciar sesion.';
          this.form = {
            email: '',
            nombre: '',
            apellido: '',
            dni: '',
            password: '',
            passwordConfirm: '',
          };

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 900);
        },
        error: (error) => {
          const backendMessage = error?.error?.message;
          this.errorMessage =
            typeof backendMessage === 'string'
              ? backendMessage
              : 'No se pudo registrar el usuario.';
        },
      });
  }
}

