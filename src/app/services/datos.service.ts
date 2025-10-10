import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap} from 'rxjs';

import { Datos } from '../models/datos';
import { connection } from '../security/production'; // usa tu base ya definida
import { DatosVM } from '../home/datos/datos.adapters';

const httpOption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};
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

  deleteDatos(ids: { TrabajoID: string, Archivo: string}[]): Observable<any> {
    return this.http.request<any>('delete', `${this.base}/piezas`, {
      body: ids,
      ...httpOption,
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
        console.log("datos: ", datos);
        const filtrados = datos.filter((lote: Datos) => lote.TrabajoID === trabajoID);
        return filtrados;
      })
    );
  }

  async uploadFiles(files: File[], trabajoID: string): Promise<{ files: string[], urls: string[] }> {
    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file); // ✅ múltiples archivos bajo la misma clave
    });

    formData.append('TrabajoID', trabajoID);

    const response = await fetch(`${this.base}/upload`, {
      method: 'POST',
      body: formData,
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`Error uploading files: ${response.status}`);
    }

    return await response.json(); // { files: [...], urls: [...] }
  }
  
  async postFilesData(urls: string[], trabajoID: string): Promise<any[] | null> {
    const payload = {
      TrabajoID: trabajoID,
      PiezasOriginales: urls
    };

    console.log("📦 Payload a enviar:", payload);

    const response = await fetch(`${this.base}/procesar_archivos`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow'
    });

    const data = await response.json();
    console.log("✅ Datos procesados:", data.detalles);
    return data.detalles;
  }

  async postPiezasData(endpoint: string, dataPiezas: (Datos|DatosVM)[], ): Promise<Datos[]> {
    try {
      const allowedKeys = [
        "TrabajoID",
        "Archivo", 
        "Cantidad", 
        "Perfil", 
        "Cara", 
        "Longitud", 
        "Peso",
        "Coordenadas",
        "Angulos",
        "Lista X (Agujeros)",
        "Material",
        "Alto",
        "Calidad",
        "Formato",
        "Origen",
      ];

      const filteredDataPiezas = dataPiezas.map((row: any) => {
        const filteredRow: Partial<any> = {};
        for (const key of allowedKeys) {
          if (row[key] !== undefined) {
            filteredRow[key] = row[key];
          }
        }

        // Serializar campos complejos
        if (filteredRow['Coordenadas']) {
          filteredRow['Coordenadas'] = JSON.stringify(filteredRow['Coordenadas']);
        }
        if (filteredRow["Lista X (Agujeros)"]) {
          filteredRow["Lista X (Agujeros)"] = JSON.stringify(filteredRow["Lista X (Agujeros)"]);
        }
        if (filteredRow['Angulos']) {
          filteredRow['Angulos'] = JSON.stringify(filteredRow['Angulos']);
        }

        return filteredRow as Datos;
      });

      const url = `${this.base}/${endpoint}`;
      console.log("📡 URL a enviar:", url);
      console.log("📦 Payload:", filteredDataPiezas);

      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(filteredDataPiezas),
        headers: {
          "Content-Type": "application/json"
        },
        redirect: "follow"
      });

      if (!response.ok) {
        throw new Error(`Error posting piezas: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Respuesta del servidor:", data);
      return data;
    } catch (error) {
      console.error("❌ Error al enviar piezas:", error);
      throw error;
    }
  }
}
