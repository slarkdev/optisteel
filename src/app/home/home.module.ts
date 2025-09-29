import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { MaterialModule } from '../shared/material.module';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { HomeRoutingModule } from './home-routing.module';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { InventarioComponent } from './inventario/inventario.component';
import { MaterialModule } from '../shared/material.module';
import { DatosComponent } from './datos/datos.component';
import { AnalisisComponent } from './analisis/analisis.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { LotesComponent } from './lotes/lotes.component';
import { ProyectosComponent } from './proyectos/proyectos.component';
import { ReportesComponent } from './reportes/reportes.component';

@NgModule({
  declarations: [
    // aqui declaras los componentes que vas a utilizar
    HomeComponent,
    DatosComponent,
    AnalisisComponent,
    ConfiguracionComponent,
    InventarioComponent,
    LotesComponent,
    ProyectosComponent,
    ReportesComponent
  ],
  exports: [MaterialModule],
  imports: [CommonModule, 
    RouterModule, 
    HomeRoutingModule, 
    MaterialModule],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class HomeModule {}
