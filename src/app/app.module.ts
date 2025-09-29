import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes } from '@angular/router';
import { HomeRoutingModule } from './home/home-routing.module';
import { AuthGuard } from './security/auth.guard';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {   path: '', redirectTo: '/login', pathMatch:'full'},

  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'home',
    loadChildren: () => HomeRoutingModule,
    canActivate: [AuthGuard],
    data: { acceso: [] },
  },
  { path: '**', component: NotFoundComponent },
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class AppModule { }
