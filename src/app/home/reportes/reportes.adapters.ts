import { Reportes, ReportesVM } from '../../models/reportes';

function toNumber(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    // Quita % y separadores de miles si los hubiera
    const clean = val.replace(/%/g, '').replace(/,/g, '.').trim();
    const n = Number(clean);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

export function toVM(row: Reportes): ReportesVM {
  const LongitudTotal_sin =
    row.LongitudTotal_sin !== undefined
      ? toNumber(row.LongitudTotal_sin)
      : toNumber(row.Longitud_sin);

  const LongitudTotal_con =
    row.LongitudTotal_con !== undefined
      ? toNumber(row.LongitudTotal_con)
      : toNumber(row.Longitud_con);

  return {
    _id: row._id,
    TrabajoID: row.TrabajoID,

    Perfil: row.Perfil ?? '',
    Calidad: row.Calidad ?? '',
    Peso: toNumber(row.Peso),

    // Sin empate
    Cantidad_sin: toNumber(row.Cantidad_sin),
    LongitudTotal_sin,
    Saldo_sin: toNumber(row.Saldo_sin),
    Residuo_sin: toNumber(row.Residuo_sin),
    Desperdicio_sin: toNumber(row.Desperdicio_sin),
    Cortes_sin: toNumber(row.Cortes_sin),

    // Con empate
    Cantidad_con: toNumber(row.Cantidad_con),
    LongitudTotal_con,
    Saldo_con: toNumber(row.Saldo_con),
    Residuo_con: toNumber(row.Residuo_con),
    Desperdicio_con: toNumber(row.Desperdicio_con),
    Cortes_con: toNumber(row.Cortes_con),

    Pdf_file: row.Pdf_file ?? null,
    Pdf_file_compara: row.Pdf_file_compara ?? null,
  };
}

export function toVMList(rows: Reportes[]): ReportesVM[] {
  return rows.map(toVM);
}
