import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Response } from '../models/response';
import { Lotes } from '../models/lotes';
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
export class ApiLotesService {
  private loteSubject = new BehaviorSubject<any>(null);
  loter$ = this.loteSubject.asObservable();

  private readonly url: string = connection;
  // private readonly base = '/api'; // proxy a optisteel.ingaria.com
  //   private readonly baseUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  getLotes(user_ID: string): Observable<any> {
    return this._http.get<any>(`${this.url}trabajos/user/` + user_ID);
  }

  addLote(lote: {}): Observable<Lotes> {
    return this._http.post<Lotes>(`${this.url}/trabajos`, lote, httpOption);
  }

  deleteLotes(ids: { LotesIDs: string[] }): Observable<any> {
    return this._http.request<any>('delete', 'api/trabajos/delete-multiple', {
      body: ids,
      ...httpOption,
    });
  }

  setLote(folder: any) {
    const actual = this.loteSubject.getValue();
    if (!actual || actual._id !== folder._id) {
      this.loteSubject.next(folder);
    }
  }
}
