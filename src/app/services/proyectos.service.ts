import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Response } from '../models/response';
import { Proyectos } from '../models/proyectos';
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
export class ApiProyectosService {
  private folderSubject = new BehaviorSubject<any>(null);
  folder$ = this.folderSubject.asObservable();

  url: string = connection;
  // private readonly base = '/api'; // proxy a optisteel.ingaria.com
  private readonly baseUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  getProyectos(user_ID: string): Observable<any> {
    return this._http.get<any>(`${this.url}/folders/` + user_ID);
  }

  addProyecto(proyecto: {}): Observable<Proyectos> {
    return this._http.post<Proyectos>(
      `${this.url}/folders`,
      proyecto,
      httpOption
    );
  }

  deleteProyectos(ids: { FolderIDs: string[] }): Observable<any> {
    return this._http.request<any>('delete', 'api/folders/delete-multiple', {
      body: ids,
      ...httpOption,
    });
  }

  setFolder(folder: any) {
    const actual = this.folderSubject.getValue();
    if (!actual || actual._id !== folder._id) {
      this.folderSubject.next(folder);
    }
  }
}
