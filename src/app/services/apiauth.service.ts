import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Response } from '../models/response';
import { Usuario } from '../models/usuario';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Login } from '../models/login';
import { connection } from '../security/production';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../shared/environment';
import { Auth } from '../models/auth';
import { LoginComponent } from '../login/login.component';

const httpOption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class ApiAuthService {
  url: string = connection + 'users/';
  isLogin = false;

  //BehaviorSubject: recibe elementos desde la creacion
  private usuarioSubject: BehaviorSubject<any> = new BehaviorSubject<
    any | null
  >(null);
  public usuario: Observable<any>;

  public get usuarioData(): any {
    return this.usuarioSubject.value;
  }

  constructor(private _http: HttpClient) {
    const item = localStorage.getItem('usuario');
    this.usuarioSubject = new BehaviorSubject<any>(
      item ? JSON.parse(item) : null
    );

    this.usuario = this.usuarioSubject.asObservable();
  }

  login(login: Login) {
    return this._http
      .post<{ token: string }>('/api/login', login, httpOption)
      .pipe(
        switchMap((res) => {
          const decoded: any = jwtDecode(res.token);
          return this._http.get<Usuario>(`${this.url}${decoded.email}`).pipe(
            tap((user: Usuario) => {
              sessionStorage.setItem('access_token_optisteel', res.token);
              sessionStorage.setItem('usuario_optisteel', JSON.stringify(user));

              this.usuarioSubject.next({ ...user, token: res.token });
            })
          );
        }),
        catchError((err) =>
          throwError(() => {
            return err;
          })
        )
      );
  }

  logout(): void {
    // Eliminar tokens del almacenamiento
    sessionStorage.removeItem('access_token_optisteel');

    // notificar al sistema que ya no hay usuario
    this.isLogin = false;
    this.usuarioSubject.next(null);

    //Llamar al backend para invalidar el refresh token
    /*this.revokeToken().subscribe({
      next: () => {
        console.log('Refresh token revocado');
      },
      error: (err) => {
        console.error('Error al revocar token', err);
      },
      complete: () => {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        this.usuarioSubject.next(null);
        this.router.navigate(['/login']);
      },
    });*/
  }
  initializeSession(): void {
    const token = sessionStorage.getItem('access_token_optisteel');
    const userData = sessionStorage.getItem('usuario_optisteel');

    if (!token) {
      this.logout();
    }

    if (token && userData) {
      const user = JSON.parse(userData);
      this.usuarioSubject.next({ ...user, token });
    }

    if (token && !userData) {
      const decoded: any = jwtDecode(token);
      this._http.get<Usuario>(`${this.url}${decoded.email}`).subscribe({
        next: (user) => {
          this.usuarioSubject.next({ ...user, token });
        },
        error: () => {
          this.logout(); // por si el token ya no es válido
        },
      });
    }
  }

  isAuthenticated(): boolean {
    this.isLogin = !!sessionStorage.getItem('access_token_optisteel');
    return this.isLogin;
  }
  
  revokeToken(): Observable<any> {
    const refreshToken = sessionStorage.getItem('access_token_optisteel'); 

    return this._http.post('/api/revoke-token', { token: refreshToken }, httpOption);
  }
}
