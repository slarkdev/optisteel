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
import { Auth } from '../models/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private router: Router, private apiAuthService: ApiAuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const allowedRoles = route.data?.['acceso'];
    const usuario = this.apiAuthService.usuarioData;

    if (!usuario) {
      this.router.navigate(['/login']);
      return false;
    }

    return this.apiAuthService.usuario.pipe(
      map((user: Auth) => {
        const hasAccess = !!user; // && (!allowedRoles || allowedRoles.includes(user.tipoUsuario));
        return hasAccess;
      }),
      tap((hasAccess) => {
        if (!hasAccess) {
          alert('Acceso Denegado');
          this.router.navigate(['/login']);
        }
      })
    );
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const allowedRoles = route.data?.['acceso'];
    const usuario = this.apiAuthService.usuarioData;

    if (!usuario) {
      this.router.navigate(['/login']);
      return false;
    }

    return this.apiAuthService.usuario.pipe(
      map((user: Auth) => {
        const hasAccess =
          !!user; //&& (!allowedRoles || allowedRoles.includes(user.tipoUsuario));
        return hasAccess;
      }),
      tap((hasAccess) => {
        if (!hasAccess) {
          alert('Acceso Denegado');
          this.router.navigate(['/login']);
        }
      })
    );
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
    if (this.apiAuthService.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/home']);
    return false;
  }
}
