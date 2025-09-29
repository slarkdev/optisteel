import { Injectable } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
  UrlTree,
  Route,
  UrlSegment,
} from '@angular/router';
import { ApiAuthService } from '../services/apiauth.service';
import { Observable, map, tap } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private router: Router, private apiAuthService: ApiAuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // extraemos la información de la propiedad data de la ruta.
    const allowedRoles = route.data?.['acceso'];

    const usuario = this.apiAuthService.usuarioData;

    // usamos el user del AuthService y los roles extraídos de data para
    // implementar nuevamente la lógica de la guarda   

    if (usuario) {
      return this.apiAuthService.usuario.pipe(
        map((user : Usuario) => Boolean(user && allowedRoles.includes(user.tipoUsuario))),
        tap((hasRole) => hasRole === false && alert('Acceso Denegado'))
      );
      //return true;
    }
    this.router.navigate(['/login']);
    return false;
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const usuario = this.apiAuthService.usuarioData;
    const allowedRoles = route.data?.['acceso'];

    if (usuario) {
      let estado =  this.apiAuthService.usuario.pipe(
        
        map((user : Usuario) => Boolean(user && allowedRoles.includes(user.tipoUsuario))),
        tap((hasRole) => hasRole === false && alert('Acceso Denegado'))
      ); //this.router.navigate(['/login'] )      
      return estado;
      //return true;
    }
    this.router.navigate(['/login']);
    return false;


    // if (usuario) {
    //   return true;
    // }
    // this.router.navigate(['/login']);
    // return false;
  }

  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return true;
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }

  checkUserLogin(route: ActivatedRouteSnapshot, url: any): boolean {
    if (this.apiAuthService.isLoggedIn()) {
      return true;
    }

    this.router.navigate(['/home']);
    return false;
  }
}
