export interface Inventory {
  id: number;           // índice local para la fila (Material Table)
  _id?: string | null;  // id real del backend (Mongo, etc.)
  Perfil: string;
  Calidad: string;
  Longitud: number;
  Cantidad: number;
  Consumido: number;
  Long_mas_larga: number;
}

export interface InventoryListResponse {
  items: Inventory[];
  total: number;
}
