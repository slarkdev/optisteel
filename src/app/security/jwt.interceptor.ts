import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiAuthService } from "../services/apiauth.service";
import { Observable } from "rxjs";

@Injectable()

export class JwtInterceptor implements HttpInterceptor{

    constructor(
        private apiAuthService: ApiAuthService
    ){
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
        const usuario = this.apiAuthService.usuarioData;

        if(usuario){
            // hay sesión: clonamos y agregamos el atributo authorization con nuestro token
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${usuario.token}`
                }

            })
        }

        return next.handle(request);
    }
}