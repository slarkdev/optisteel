import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AuthGuard } from './security/auth.guard';
import { QuicklinkStrategy } from 'ngx-quicklink';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
   // canActivate: [AuthGuard],
    data: { acceso: [] },
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
   preloadingStrategy: QuicklinkStrategy
  })],
  exports: [RouterModule],
 // providers: [AuthGuard],
})
export class AppRoutingModule {}
