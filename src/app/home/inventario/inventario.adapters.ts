import { Inventory } from '../../models/inventario';

export interface InventoryVM {
  id: number;
  _id?: string | null;
  perfil: string;
  calidad: string;
  longitud: number;
  cantidad: number;
  consumido: number;
  piezaMasLarga: number;
}

export function toVM(api: Inventory, idx?: number): InventoryVM {
  return {
    id: idx ?? api.id,
    _id: api._id ?? null,
    perfil: api.Perfil ?? '',
    calidad: api.Calidad ?? '',
    longitud: api.Longitud ?? 0,
    cantidad: api.Cantidad ?? 0,
    consumido: api.Consumido ?? 0,
    piezaMasLarga: api.Long_mas_larga ?? 0,
  };
}

export function toAPI(vm: Partial<InventoryVM>): Partial<Inventory> {
  return {
    id: vm.id!,
    _id: vm._id ?? null,
    Perfil: vm.perfil!,
    Calidad: vm.calidad!,
    Longitud: vm.longitud!,
    Cantidad: vm.cantidad!,
    Consumido: vm.consumido!,
    Long_mas_larga: vm.piezaMasLarga!,
  };
}
