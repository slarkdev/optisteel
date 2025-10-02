import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Inventory } from '../models/inventario';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  /** Proxy a https://optisteel.ingaria.com */
  private readonly base = '/api';

  constructor(private http: HttpClient) {}

  /** Lista todo el inventario de un trabajo */
  list(workId: string): Observable<Inventory[]> {
    const w = encodeURIComponent(workId);
    return this.http.get<Inventory[]>(`${this.base}/inventario/${w}`);
  }

  /**
   * Crea o actualiza una fila.
   * POST  /inventario(crear/actualizar)
   */
  upsert(workId: string, rowOrRows: Partial<Inventory> | Array<Partial<Inventory>>): Observable<Inventory[]> {
    const arr = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows];
    const payload = arr.map(r => ({
      ...r,
      TrabajoID: workId,          // <- lo exige la API
    }));
    return this.http.post<Inventory[]>(`${this.base}/inventario`, payload);
  }

  /**
   * Elimina uno o varios registros.
   * DELETE /inventario  body: { ids: string[] }
   */
  deleteMany(ids: string[]): Observable<void> {
    return this.http.request<void>('DELETE', `${this.base}/inventario`, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: { ids },
    });
  }

  /** Azúcar: borrar uno solo usando el mismo endpoint */
  deleteOne(id: string): Observable<void> {
    return this.deleteMany([id]);
  }
}
