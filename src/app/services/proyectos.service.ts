import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Proyecto } from '../models/proyecto';
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
  private readonly url: string = connection;

  // private proyectoSubject = new BehaviorSubject<Proyecto | null>(null);
  // proyecto$ = this.proyectoSubject.asObservable();

  proyectos$ = new BehaviorSubject<Proyecto[]>([]);
  //listaProyectosSubject$ = new BehaviorSubject<Proyecto[]>([]);
  listaProyectos$ = this.proyectos$.asObservable();

  private proyectosCargado = false;

  private proyectoSeleccionado$ = new BehaviorSubject<Proyecto | null>(null);

  constructor(private _http: HttpClient) {}

  cargarProyectos(user_ID: string) {
    if (!this.proyectosCargado) {
      this._http
        .get<any[]>(`${this.url}/folders/` + user_ID)
        .subscribe((data) => {
          this.setProyectos(data);
        });
    }
  }

  actualizarListaProyectos(proyecto: Proyecto) {
    const actual = this.proyectos$.getValue();
    this.proyectos$.next([...actual, proyecto]);
  }

  setProyectos(proyectos: Proyecto[]) {
    this.proyectos$.next(proyectos);
    this.proyectosCargado = true;
  }

  getProyectos(): Observable<Proyecto[]> {
    return this.proyectos$.asObservable();
  }

  addProyecto(proyecto: {}): Observable<Proyecto> {
    return this._http.post<Proyecto>(
      `${this.url}/folders`,
      proyecto,
      httpOption
    );
  }

  deleteProyectos(ids: { FolderIDs: string[] }): Observable<any> {
    return this._http.request<any>('delete', `${this.url}/folders/delete-multiple`, {
      body: ids,
      ...httpOption,
    });
  }

  eliminarProyectosLocalmente(ids: string[]) {
    const actual = this.proyectos$.getValue();
    const filtrados = actual.filter((p) => !ids.includes(p._id));
    this.proyectos$.next(filtrados);
  }

  editProyecto() {}

  async actualizarProyectoSeleccionado(proyecto: Proyecto) {
    this.proyectoSeleccionado$.next(proyecto);
  }

  getProyectoSeleccionado(): Observable<Proyecto | null> {
    return this.proyectoSeleccionado$.asObservable();
  }

  // setProyecto(proyecto: any) {
  //   const actual = this.proyectoSubject.getValue();

  //   if (!proyecto || !proyecto._id) {
  //     this.proyectoSubject.next(null); // reinicia el proyecto
  //     return;
  //   }

  //   if (!actual || actual._id !== proyecto._id) {
  //     this.proyectoSubject.next(proyecto);
  //   }
  // }
}
