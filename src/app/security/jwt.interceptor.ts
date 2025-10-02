import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiAuthService } from '../services/apiauth.service';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private apiAuthService: ApiAuthService) {}

  //   intercept(
  //     request: HttpRequest<any>,
  //     next: HttpHandler
  //   ): Observable<HttpEvent<any>> {
  //     // const usuario = this.apiAuthService.usuarioData;
  //     const token = sessionStorage.getItem('access_token_optisteel');

  //     if (token) {
  //       // hay sesión: clonamos y agregamos el atributo authorization con nuestro token
  //       request = request.clone({
  //         setHeaders: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //     }

  //     return next.handle(request);
  //   }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = sessionStorage.getItem('access_token_optisteel');

    // Evita agregar token a rutas públicas como /login
    const isPublic =
      request.url.includes('/login') || request.url.includes('/register');

    if (token && !isPublic) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request);
  }
}
