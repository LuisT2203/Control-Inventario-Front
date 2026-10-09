import { Routes } from '@angular/router';
import { adminGuard } from './admin.guard';
import { authGuard } from './auth.guard';
import { CambiosComponent } from './comp/cambios/cambios.component';
import { CompraComponent } from './comp/compra/compra.component';
import { InicioComponent } from './comp/inicio/inicio.component';
import { KardexLocalComponent } from './comp/kardex-local/kardex-local.component';
import { KardexComponent } from './comp/kardex/kardex.component';
import { LocalesComponent } from './comp/locales/locales.component';
import { LoginComponent } from './comp/login/login.component';
import { ProductosComponent } from './comp/productos/productos.component';
import { UsuariosComponent } from './comp/usuarios/usuarios.component';
import { VentaComponent } from './comp/venta/venta.component';

export const routes: Routes = [
  { path: '', redirectTo: '/locales', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'locales', component: LocalesComponent, canActivate: [authGuard] },
  { path: 'inicio/:idLocal', component: InicioComponent, canActivate: [authGuard] },
  { path: 'venta/:idLocal', component: VentaComponent, canActivate: [authGuard] },
  { path: 'compra/:idLocal', component: CompraComponent, canActivate: [authGuard] },
  { path: 'cambios/:idLocal', component: CambiosComponent, canActivate: [authGuard] },
  { path: 'kardex-local/:idLocal', component: KardexLocalComponent, canActivate: [authGuard] },
  { path: 'productos/:idLocal', component: ProductosComponent, canActivate: [authGuard] },
  { path: 'kardex/:idProducto', component: KardexComponent, canActivate: [authGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: '/locales' }
];
