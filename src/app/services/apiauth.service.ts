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
  VITE_BASE_URL = 'https://optisteel.ingaria.com';
  isLogin = false;

  //BehaviorSubject: recibe elementos desde la creacion
  private usuarioSubject: BehaviorSubject<Auth>;
  public usuario: Observable<Auth>;

  public get usuarioData(): Auth {
    return this.usuarioSubject.value;
  }

  constructor(private _http: HttpClient) {
    const item = localStorage.getItem('usuario');
    this.usuarioSubject = new BehaviorSubject<Auth>(
      item ? JSON.parse(item) : null
    );

    this.usuario = this.usuarioSubject.asObservable();
  }

  login(login: Login) {
    return this._http
      .post<{ token: string }>('/api/login', login, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(
        map((res) => {
          console.log(res);

          const decoded: any = jwtDecode(res.token);
          console.log(decoded);
          const usuario: Auth = {
            ...decoded,
            token: res.token,
          };

          this.usuarioSubject.next(usuario);
          return usuario;
          /*return this._http
            .get<Usuario>(`${this.VITE_BASE_URL}/users/${decoded.email}`)
            .pipe(
              tap((user: any) => {
                this.usuarioSubject.next({ ...user, token: res.token });
              })
            );*/
        }),
        catchError((err) =>
          throwError(() => {
            err;
          })
        )
      );
  }

  logout() {
    this.isLogin = false;
    localStorage.removeItem('usuario');
    // le decimos a todos los inscritos que ya no hay un usuario
    this.usuarioSubject.next(null!);
  }

  isLoggedIn() {
    const loggedIn = localStorage.getItem('usuario');
    if (loggedIn) this.isLogin = true;
    else this.isLogin = false;
    return this.isLogin;
  }
}
