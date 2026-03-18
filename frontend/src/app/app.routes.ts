import { Routes } from '@angular/router';
import { PaginaInicio } from './pages/pagina-inicio/pagina-inicio';
import { Membresias } from './pages/membresias/membresias';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { MenuAdmin } from './pages/menu-admin/menu-admin';
import { MenuCliente } from './pages/menu-cliente/menu-cliente';
import { GestionUsuarios } from './pages/gestion-usuarios/gestion-usuarios';
import { AltaUsuarios } from './pages/alta-usuarios/alta-usuarios';
import { GestionMembresias } from './pages/gestion-membresias/gestion-membresias';
import { AsignarPlan } from './pages/asignar-plan/asignar-plan';
import { CrearPlan } from './pages/crear-plan/crear-plan';
import { CambiarMembresia } from './pages/cambiar-membresia/cambiar-membresia';
import { EditarPlan } from './pages/editar-plan/editar-plan';
import { VerPlan } from './pages/ver-plan/ver-plan';
import { MiPlan } from './pages/mi-plan/mi-plan';
import { MiMembresia } from './pages/mi-membresia/mi-membresia';
import { MisPagos } from './pages/mis-pagos/mis-pagos';
import { HistorialDePagos } from './pages/historial-de-pagos/historial-de-pagos';
// Configuracion de rutas de toda la aplicacion.
export const routes: Routes = [
	// Ruta raiz: cuando entras a / muestra la pagina de inicio.
	{ path: '', component: PaginaInicio },
	{ path: 'inicio', component: PaginaInicio },
    { path: 'membresias', component: Membresias },
	{ path: 'login', component: Login },
	{ path: 'register', component: Register },
	{ path: 'menu-admin', component: MenuAdmin },
	{ path: 'menu-cliente', component: MenuCliente },
	{ path: 'gestion-usuarios', component: GestionUsuarios },
	{ path: 'alta-usuarios', component: AltaUsuarios },
	{ path: 'gestion-membresias', component: GestionMembresias },
	{ path: 'asignar-plan', component: AsignarPlan },
	{ path: 'crear-plan', component: CrearPlan },
	{ path: 'cambiar-membresia', component: CambiarMembresia },
	{ path: 'editar-plan', component: EditarPlan },
	{ path: 'ver-plan', component: VerPlan },
	{ path: 'mi-plan', component: MiPlan },
	{ path: 'mi-membresia', component: MiMembresia },
	{ path: 'mis-pagos', component: MisPagos },
	{ path: 'historial-de-pagos', component: HistorialDePagos },
	// Comodin: cualquier URL no existente redirige al home.
	{ path: '**', redirectTo: '' },
];
