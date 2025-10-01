import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Response } from '../models/response';
import { Proyectos } from '../models/proyectos';
import { connection } from '../security/production';

const httpOption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class ApiProyectosService {
  url: string = connection + 'folders/';
  constructor(private _http: HttpClient) {}

  getProyectos(user_ID: string): Observable<any> {
    return this._http.get<any>(this.url + user_ID);
  }

  addProyecto(proyecto: {}): Observable<Proyectos> {
    return this._http.post<Proyectos>('api/data/folders', proyecto, httpOption);
  }

  deleteProyectos(ids: { FolderIDs: string[] }): Observable<any> {
    return this._http.request<any>(
      'delete',
      'api/data/folders/delete-multiple',
      {
        body: ids,
        ...httpOption,
      }
    );
  }
}
