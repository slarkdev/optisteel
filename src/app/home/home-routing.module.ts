import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { AuthGuard } from '../security/auth.guard';
import { InventarioComponent } from './inventario/inventario.component';
import { LotesComponent } from './lotes/lotes.component';
import { DatosComponent } from './datos/datos.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { ProyectosComponent } from './proyectos/proyectos.component';
import { AnalisisComponent } from './analisis/analisis.component';
import { ReportesComponent } from './reportes/reportes.component';
//import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    //canActivate: [AuthGuard],
    data: {
      acceso: [],
    },
   // canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
      {
        path: 'lotes',
        component: LotesComponent,
        data: {
          acceso: [],
        },
      },
      {
        path: 'inventario',
        component: InventarioComponent,
        data: {
          acceso: [],
        },
      },
      {
        path: 'datos',
        component: DatosComponent,
        data: {
          acceso: [],
        },
      },

      {
        path: 'configuracion',
        component: ConfiguracionComponent,
        data: {
          acceso: [],
        },
      },

      {
        path: 'proyectos',
        component: ProyectosComponent,
        data: {
          acceso: [],
        },
      },

      {
        path: 'analisis',
        component: AnalisisComponent,
        data: {
          acceso: [],
        },
      },

      {
        path: 'reportes',
        component: ReportesComponent,
        data: {
          acceso: [],
        },
      },

    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
 // providers: [AuthGuard],
})
export class HomeRoutingModule {}
