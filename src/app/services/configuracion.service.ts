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
export class ApiConfiguracionService {
  private readonly url: string = connection;

  private configuracionSubject = new BehaviorSubject<Configuracion | null>(
    null
  );
  configuracion$ = this.configuracionSubject.asObservable();

  constructor(private _http: HttpClient) {}

  getConfiguracion(idTrabajo: string): Observable<Configuracion> {
    return this._http.get<Configuracion>(
      `${this.url}/configuracion/${idTrabajo}`,
      httpOption
    );
  }

  addConfiguracion(
    configuracion: {},
    idTrabajo: string
  ): Observable<Configuracion> {
    const data = {
      ...configuracion,
      idTrabajo,
    };

    return this._http.post<Configuracion>(
      `${this.url}/configuracion`,
      data,
      httpOption
    );
  }
}
