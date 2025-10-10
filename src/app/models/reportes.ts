export interface Reportes {
  id: number;
  _id: string;
  TrabajoID: string;

  Perfil: string;
  Calidad: string;
  Peso: number;

  // SIN EMPATE (nombres heredados)
  Cantidad_sin?: number;
  Longitud_sin?: number;           // a veces llega así…
  LongitudTotal_sin?: number;      // …o así (adapter normaliza)
  Saldo_sin?: number | string;     // puede venir como string en %
  Residuo_mm_sin?: number | string;
  Residuo_sin?: number | string;   // porcentaje
  Desperdicio_mm_sin?: number | string;
  Desperdicio_sin?: number | string; // porcentaje
  Cortes_sin?: number;

  // CON EMPATE
  Cantidad_con?: number;
  Longitud_con?: number;
  LongitudTotal_con?: number;
  Saldo_con?: number | string;
  Residuo_mm_con?: number | string;
  Residuo_con?: number | string;
  Desperdicio_mm_con?: number | string;
  Desperdicio_con?: number | string;
  Cortes_con?: number;

  Pdf_file?: string | null;
  Pdf_file_compara?: string | null;
}

// VM para la tabla con claves exactamente como tus columnas legacy
export interface ReportesVM {
  _id: string;
  TrabajoID: string;

  Perfil: string;
  Calidad: string;
  Peso: number;

  // Grupo: Sin empate
  Cantidad_sin: number;
  LongitudTotal_sin: number;
  Saldo_sin: number;         // en %
  Residuo_sin: number;       // en %
  Desperdicio_sin: number;   // en %
  Cortes_sin: number;

  // Grupo: Con empate
  Cantidad_con: number;
  LongitudTotal_con: number;
  Saldo_con: number;         // en %
  Residuo_con: number;       // en %
  Desperdicio_con: number;   // en %
  Cortes_con: number;

  // opcionales por si muestras acciones
  Pdf_file?: string | null;
  Pdf_file_compara?: string | null;
}
