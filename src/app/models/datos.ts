export interface Datos {
  id: string;           // índice local para la fila (Material Table)
  _id?: string | null;  // id real del backend (Mongo, etc.)
  TrabajoID: string;
  Archivo: string;
  Cara: string;
  Perfil: string;
  Calidad: string;
  Longitud: number;
  Cantidad: number;
  Peso: number;
  Coordenadas: string;
  "Lista X (Agujeros)": string;
  Material: string;
  Referencia: string;
  OrdenProduccion: string;
  Origen: string;
  Formato: string;
  Cubierto: string;
  archivo_usado: boolean;
  Alto: number;
  Pieza: string;
  Agujeros: string;
}

export interface DatosListResponse {
  items: Datos[];
  total: number;
}
