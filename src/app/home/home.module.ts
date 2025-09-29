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

@NgModule({
  declarations: [
    // aqui declaras los componentes que vas a utilizar
    HomeComponent,
    InventarioComponent
  ],
  exports: [],
  imports: [CommonModule, RouterModule, HomeRoutingModule],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class HomeModule {}
