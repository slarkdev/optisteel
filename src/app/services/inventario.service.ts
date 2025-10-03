import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Inventory } from '../models/inventario';
import { connection } from '../security/production'; // usa tu base ya definida

@Injectable({ providedIn: 'root' })
export class InventarioService {
  // Normaliza la base para evitar '//' al concatenar
  private readonly base = connection.replace(/\/+$/, '');

  private contextoSubject = new BehaviorSubject<{
    idProyecto: any;
    idLote: any;
  } | null>(null);
  contexto$ = this.contextoSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Lista todo el inventario de un trabajo: GET /inventario/:workId */
  list(workId: string): Observable<Inventory[]> {
    const w = encodeURIComponent(workId);
    return this.http.get<Inventory[]>(`${this.base}/inventario/${w}`);
  }

  /**
   * Inserta o actualiza (la API acepta SIEMPRE un ARREGLO en el body)
   * POST /inventario
   * payload: [{ _id?, Perfil, Cantidad, Longitud, Calidad, TrabajoID }]
   */
  upsert(
    workId: string,
    rowOrRows: Partial<Inventory> | Array<Partial<Inventory>>
  ): Observable<Inventory[]> {
    const arr = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows];
    const payload = arr.map((r) => ({
      ...r,
      TrabajoID: workId, // requerido por la API
    }));
    return this.http.post<Inventory[]>(`${this.base}/inventario`, payload);
  }

  /**
   * Elimina uno o varios registros.
   * DELETE /inventario  (body: { ids: string[] })
   */
  deleteMany(ids: string[]): Observable<void> {
    return this.http.request<void>(`DELETE`, `${this.base}/inventario`, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: { ids },
    });
  }

  /** Azúcar: borrar uno solo usando el mismo endpoint */
  deleteOne(id: string): Observable<void> {
    return this.deleteMany([id]);
  }

  setContexto(idProyecto: any, idLote: any) {
    this.contextoSubject.next({ idProyecto, idLote });
  }
}
