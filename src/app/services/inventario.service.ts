import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Inventory } from '../models/inventario';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly base = '/api'; // proxy a optisteel.ingaria.com

  constructor(private http: HttpClient) {}

  list(workId: string): Observable<Inventory[]> {
    const params = new HttpParams().set('workId', workId);
    return this.http.get<Inventory[]>(`${this.base}/inventario`, { params });
  }

  upsert(workId: string, row: Partial<Inventory>): Observable<any> {
    return this.http.post(`${this.base}/inventario`, { workId, ...row });
  }

  deleteMany(ids: string[]): Observable<any> {
    // 👈 importante: usar el mismo endpoint proxyeado
    return this.http.request('DELETE', `${this.base}/inventario`, { body: { ids } });
  }
}
