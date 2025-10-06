import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { Response } from '../models/response';
import { Lote } from '../models/lote';
import { connection } from '../security/production';
import {
  map,
  filter,
  switchMap,
  tap,
  distinctUntilChanged,
} from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { ApiProyectosService } from './proyectos.service';

const httpOption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class ApiLotesService {
  private readonly url: string = connection;

  private loteSubject = new BehaviorSubject<any>(null);
  lote$ = this.loteSubject.asObservable();

  // subject lotes
  private lotes$ = new BehaviorSubject<Lote[]>([]);
  lotesCargado = false;
  private loteSeleccionado$ = new BehaviorSubject<Lote | null>(null);
  lotesFiltrados$: Observable<Lote[]>;

  constructor(
    private _http: HttpClient,
    private apiProyectoService: ApiProyectosService
  ) {
    this.lotesFiltrados$ = combineLatest([
      this.lotes$,
      this.apiProyectoService.getProyectoSeleccionado(),
    ]).pipe(
      map(([lotes, proyecto]) =>
        lotes.filter((l) => l.FolderID === proyecto?._id)
      ),
      distinctUntilChanged(
        (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
      )
    );
  }

  cargarLotes(user_ID: string): Promise<void> {
    if (this.lotesCargado) return Promise.resolve();

    return this._http
      .get<any>(`${this.url}trabajos/user/` + user_ID)
      .pipe(
        map((response) => {
          const lotesTransformados = response.map((lote: any) => {
            const cubiertos =
              lote.unique_perfiles?.reduce(
                (acc: number, perfil: any) => acc + perfil.nUsados,
                0
              ) || 0;

            return {
              ...lote,
              cubiertos_count: cubiertos,
              no_cubiertos_count: lote.piezas_count - cubiertos,
            };
          });

          this.lotes$.next([...lotesTransformados]);
          this.lotesCargado = true;
        })
      )
      .toPromise(); // esto convierte el Observable en Promise
  }

  getLotesPorProyecto(proyectoId: string): Observable<any[]> {
    return this.lotes$.pipe(
      map((lotes: any[]) =>
        lotes.filter((lote: any) => lote.FolderID === proyectoId)
      )
    );
  }

  getLotesTodos(): Observable<any[]> {
    return this.lotes$.asObservable();
  }

  addLote(lote: {}): Observable<Lote> {
    return this._http.post<Lote>(`${this.url}/trabajos`, lote, httpOption);
  }

  deleteLotes(ids: { TrabajoIDs: string[] }): Observable<any> {
    return this._http.request<any>('delete', `${this.url}/trabajos`, {
      body: ids,
      ...httpOption,
    });
  }

  actualizarListaLotes(lote: Lote) {
    const actual = this.lotes$.getValue();
    const actualizados = [...actual, lote];
    this.lotes$.next(actualizados);
    console.log('✅ Lotes después de agregar:', actualizados);
  }

  
  actualizarLoteSeleccionado(lote: Lote) {
    this.loteSeleccionado$.next(lote);
  }
  
  eliminarLotesLocalmente(ids: string[]) {
    const actual = this.lotes$.getValue();
    const filtrados = actual.filter((p) => !ids.includes(p._id));
    this.lotes$.next(filtrados);
  }

  getLoteSeleccionado(): Observable<Lote | null> {
    return this.loteSeleccionado$.asObservable();
  }

  resetearLotes() {
    this.lotes$.next([]);
    this.lotesCargado = false;
  }

  setLote(folder: any) {
    const actual = this.loteSubject.getValue();
    if (!actual || actual._id !== folder._id) {
      this.loteSubject.next(folder);
    }
  }

  async actualizarProyectoSeleccionado(lotes: Lote) {
    this.loteSeleccionado$.next(lotes);
  }
}
