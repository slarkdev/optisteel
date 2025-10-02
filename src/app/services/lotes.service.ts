
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  constructor(private _http: HttpClient) {}
  
  url: string = connection;
  // private readonly base = '/api'; // proxy a optisteel.ingaria.com
  private readonly baseUrl = environment.apiUrl;

  getLotes(user_ID: string): Observable<any> {
    const response = this._http.get<any>(`${this.url}/trabajos/user/` + user_ID);
    return response;
  }

  // addLotes(user_ID: string, name: string, createdAt:string, 
  //         updatedAt: string, createdBy: string, piezas_count:string, 
  //         cubiertos_count: string, no_cubiertos_count: string): Observable<Lotes> {
  //   return this._http.post<Lotes>(this.url, 
  //     [user_ID, name, createdAt, updatedAt, createdBy, piezas_count, piezas_count, no_cubiertos_count], httpOption);
  // }

  addLotes(lote: {}): Observable<Lotes> {
    console.log('lote:', lote);
    return this._http.post<Lotes>(
      `${this.url}/trabajos/`,
      lote,
      httpOption
    );
  }
  
  deleteLotes(ids: { TrabajoIDs: string[] }): Observable<any> {
    return this._http.request<any>('delete', `${this.url}/trabajos`, {
      body: ids,
      ...httpOption,
    });
  }

}
