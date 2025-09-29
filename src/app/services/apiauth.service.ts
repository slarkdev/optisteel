import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Response } from '../models/response';
import { Usuario } from '../models/usuario';
import { map } from 'rxjs/operators';
import { Login } from '../models/login';
import { connection } from '../security/production';
import Swal from 'sweetalert2';

const httpOption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class ApiAuthService {
  url: string = connection + 'User/login';
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

  login(login: Login): Observable<Response> {
    return this._http.post<Response>(this.url, login, httpOption).pipe(
      map((res) => {
        if (res.exito == 1) {
          
          const usuario: Usuario = res.data;
          localStorage.setItem('usuario', JSON.stringify(usuario));

          // usuarioSubject es un observable, cuando aplicas next todos los inscritos ejecutan algo,
          // ej: cuando exista un usuario mostramos su nombre
          this.usuarioSubject.next(usuario);
          this.isLogin = true;
        } 
        return res;
      })
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
