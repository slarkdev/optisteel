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

const httpOption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class ApiAuthService {
  VITE_BASE_URL = 'https://optisteel.ingaria.com'

  url: string = "https://xfzt4cg93k.execute-api.us-east-2.amazonaws.com/dev/auth"; //connection + 'User/login';
  isLogin = false;

  //BehaviorSubject: recibe elementos desde la creacion
  private usuarioSubject: BehaviorSubject<Usuario>;
  public usuario: Observable<Usuario>;

  public get usuarioData(): Usuario {
    return this.usuarioSubject.value;
  }

  constructor(private _http: HttpClient) {
    const item = localStorage.getItem('usuario');
    this.usuarioSubject = new BehaviorSubject<Usuario>(
      item ? JSON.parse(item) : null
    );

    this.usuario = this.usuarioSubject.asObservable();
  }

  login(login: Login) {
  return this._http.post<{ token: string }>('/api/login', login).pipe(
    switchMap((res) => {
      const decoded: any = jwtDecode(res.token);
      return this._http.get<Usuario>(`${environment.apiUrl}/users/${decoded.email}`).pipe(
        tap((user) => {
          this.usuarioSubject.next({ ...user, token: res.token });
        })
      );
    }),
    catchError(err => throwError(() => err))
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
