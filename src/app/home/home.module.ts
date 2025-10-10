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
import { TablaReportesComponent } from './reportes/tabla-reportes.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MAT_PAGINATOR_INTL_PROVIDER } from '@angular/material/paginator';
import { LOCALE_ID } from '@angular/core';
import { UpdateDialogComponent } from './inventario/update-dialog/update-dialog.component';
import { TablaAnalisisComponent } from './analisis/tabla-analisis/tabla-analisis.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


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
    ReportesComponent,
    TablaReportesComponent,
    UpdateDialogComponent,
    TablaAnalisisComponent
  ],
  exports: [
    MaterialModule
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    FormsModule,
    HomeRoutingModule,
    MaterialModule,
    // BrowserAnimationsModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' },
    MAT_PAGINATOR_INTL_PROVIDER,
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class HomeModule {}
