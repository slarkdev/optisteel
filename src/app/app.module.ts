import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
//import { MaterialModule } from './shared/material.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtInterceptor } from './security/jwt.interceptor';
import { HomeModule } from './home/home.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RouterModule } from '@angular/router';
import { QuicklinkStrategy } from 'ngx-quicklink';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from './shared/material.module';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [AppComponent, LoginComponent, NotFoundComponent],
  imports: [
    ReactiveFormsModule,
    RouterModule,
    BrowserModule,
    MaterialModule,
    AppRoutingModule,
    HttpClientModule,
    //HomeModule,
  ],

  exports: [MaterialModule],
  providers: [
    
    QuicklinkStrategy,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    provideAnimationsAsync(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
