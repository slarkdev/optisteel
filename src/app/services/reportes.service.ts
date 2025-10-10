import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Reportes } from '../models/reportes';
import { connection } from '../security/production';

const httpOption = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly base = connection.replace(/\/+$/, '');

  private contexto$ = new BehaviorSubject<{
    idProyecto: any;
    idLote: any;
    nombreProyecto: string;
    nombreLote: string;
  } | null>(null);

  private reportes$ = new BehaviorSubject<Reportes[]>([]);

  constructor(private http: HttpClient) {}

  list(workId: string): Observable<Reportes[]> {
    const w = encodeURIComponent(workId);
    return this.http.get<Reportes[]>(`${this.base}/reportes/${w}`).pipe(
      tap((rows) => this.reportes$.next(rows))
    );
  }

  getPorTrabajoID(trabajoID: string): Observable<Reportes[]> {
    return this.reportes$.pipe(
      map((rows) => rows.filter((r) => r.TrabajoID === trabajoID))
    );
  }

  setContexto(idProyecto: any, idLote: any, nombreProyecto: string, nombreLote: string) {
    this.contexto$.next({ idProyecto, idLote, nombreProyecto, nombreLote });
  }

  // Opcionales si luego necesitas CRUD
  upsert(rows: Partial<Reportes> | Partial<Reportes>[]): Observable<Reportes[]> {
    const arr = Array.isArray(rows) ? rows : [rows];
    return this.http.post<Reportes[]>(`${this.base}/reportes`, arr, httpOption);
  }

  deleteMany(ids: string[]): Observable<void> {
    return this.http.request<void>('DELETE', `${this.base}/reportes`, {
      ...httpOption,
      body: { ids },
    });
  }
}
