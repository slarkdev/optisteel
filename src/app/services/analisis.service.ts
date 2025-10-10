import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

  private analisisSubject = new BehaviorSubject<any | null>(
    null
  );
  analisis$ = this.analisisSubject.asObservable();

  constructor(private _http: HttpClient) {}

  getPiezas(idTrabajo: string): Observable<any> {
    return this._http.get<any>(
      `${this.url}/piezas/${idTrabajo}`,
      httpOption
    );
  }

  getPiezasSinEmpate(idTrabajo: string): Observable<any> {
    return this._http.get<any>(
      `${this.url}/piezas-sin-empates/${idTrabajo}`,
      httpOption
    );
  }

  getPiezasConEmpate(idTrabajo: string): Observable<any> {
    return this._http.get<any>(
      `${this.url}/piezas-con-empates/${idTrabajo}`,
      httpOption
    );
  }

  getInventarioPiezas(idTrabajo: string): Observable<any> {
    return this._http.get<any>(
      `${this.url}/inventario/piezas/${idTrabajo}`,
      httpOption
    );
  }

  postPiezasConEmpateNesting(body: {}): Observable<any> {
    return this._http.post<any>(
      `${this.url}/piezas-con-empates/${body}`,
      httpOption
    );
  }

  postPiezasSinEmpateNesting(body: {}): Observable<any> {
    return this._http.post<any>(
      `${this.url}/piezas-sin-empates/${body}`,
      httpOption
    );
  }

  getPiezasConEmpateNesting(
    idTrabajo: string,
    perfil: string,
    calidad: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('TrabajoID', idTrabajo)
      .set('Perfil', perfil)
      .set('Calidad', calidad);

    return this._http.get<any>(`${this.url}/piezas-con-empates`, {
        ...httpOption,
      params,
    });
  }

   getPiezasSinEmpateNesting(
    idTrabajo: string,
    perfil: string,
    calidad: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('TrabajoID', idTrabajo)
      .set('Perfil', perfil)
      .set('Calidad', calidad);

    return this._http.get<any>(`${this.url}/piezas-sin-empates`, {
        ...httpOption,
      params,
    });
  }
}
