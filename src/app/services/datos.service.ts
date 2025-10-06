import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap} from 'rxjs';

import { Datos } from '../models/datos';
import { connection } from '../security/production'; // usa tu base ya definida

@Injectable({ providedIn: 'root' })
export class DatosService {
  // Normaliza la base para evitar '//' al concatenar
  private readonly base = connection.replace(/\/+$/, '');

  private contextoSubject = new BehaviorSubject<{
    idProyecto: any;
    idLote: any;
    nombreProyecto: string, 
    nombreLote: string
  } | null>(null);
  contexto$ = this.contextoSubject.asObservable();
  
  private datos$ = new BehaviorSubject<Datos[]>([]);

  constructor(private http: HttpClient) {}

  /** Lista todo el inventario de un trabajo: GET /inventario/:workId */
  list(workId: string): Observable<Datos[]> {
    const w = encodeURIComponent(workId);
    console.log("YEEE?");
    return this.http.get<Datos[]>(`${this.base}/piezas/${w}`).pipe(      
      tap((datos) => this.datos$.next(datos)) // guarda en el BehaviorSubject
    );

  }

  /**
   * Inserta o actualiza (la API acepta SIEMPRE un ARREGLO en el body)
   * POST /inventario
   * payload: [{ _id?, Perfil, Cantidad, Longitud, Calidad, TrabajoID }]
   */
  upsert(
    workId: string,
    rowOrRows: Partial<Datos> | Array<Partial<Datos>>
  ): Observable<Datos[]> {
    const arr = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows];
    const payload = arr.map((r) => ({
      ...r,
      TrabajoID: workId, // requerido por la API
    }));
    return this.http.post<Datos[]>(`${this.base}/piezas`, payload);
  }

  /**
   * Elimina uno o varios registros.
   * DELETE /inventario  (body: { ids: string[] })
   */
  deleteMany(ids: string[]): Observable<void> {
    return this.http.request<void>(`DELETE`, `${this.base}/piezas`, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: { ids },
    });
  }

  /** Azúcar: borrar uno solo usando el mismo endpoint */
  deleteOne(id: string): Observable<void> {
    return this.deleteMany([id]);
  }

  setContexto(idProyecto: any, idLote: any, nombreProyecto: string, nombreLote: string) {
    this.contextoSubject.next({ idProyecto, idLote, nombreProyecto, nombreLote });
  }

  getDatosPorTrabajoID(trabajoID: string): Observable<Datos[]> {
    return this.datos$.pipe(
      map((datos: Datos[]) => {
        const filtrados = datos.filter((lote: Datos) => lote.TrabajoID === trabajoID);
        return filtrados;
      })
    );
  }
}
