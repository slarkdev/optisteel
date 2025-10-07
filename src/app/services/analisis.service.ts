import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Configuracion } from '../models/configuracion';
import { connection } from '../security/production';

import { environment } from '../../environments/environment';

const httpOption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class ApiAnalisisService {
  private readonly url: string = connection;

  private configuracionSubject = new BehaviorSubject<Configuracion | null>(
    null
  );
  configuracion$ = this.configuracionSubject.asObservable();

  constructor(private _http: HttpClient) {}

  getPiezas(idTrabajo: string): Observable<Configuracion> {
    return this._http.get<Configuracion>(
      `${this.url}/piezas/${idTrabajo}`,
      httpOption
    );
  }

  getPiezasSinEmpate(idTrabajo: string): Observable<Configuracion> {
    return this._http.get<Configuracion>(
      `${this.url}/piezas-sin-empates/${idTrabajo}`,
      httpOption
    );
  }

  getPiezasConEmpate(idTrabajo: string): Observable<Configuracion> {
    return this._http.get<Configuracion>(
      `${this.url}/piezas-con-empates/${idTrabajo}`,
      httpOption
    );
  }

  getInventarioPiezas(idTrabajo: string): Observable<Configuracion> {
    return this._http.get<Configuracion>(
      `${this.url}/inventario/piezas/${idTrabajo}`,
      httpOption
    );
  }

}


