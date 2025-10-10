import { Datos } from '../../models/datos';

export interface DatosVM {
    id: string;           // índice local para la fila (Material Table)
    _id?: string | null;  // id real del backend (Mongo, etc.)
    TrabajoID: string;
    Perfil: string;
    Material: string;
    Longitud: number;
    Cantidad: number;
    Peso: number;
    Archivo: string;
    Formato: string;
    Alto: number;
    Agujeros: string;
    Origen: string;
}

export function toVM(api: Datos, idx?: string): DatosVM {
  return {
    id: idx ?? api.id,
    _id: api._id ?? null,  
    TrabajoID: api.TrabajoID ?? '',
    Perfil: api.Perfil ?? '',  
    Material: api.Material ?? '',
    Longitud: api.Longitud ?? 0,
    Cantidad: api.Cantidad ?? 0,
    Peso: api.Peso ?? 0,
    Archivo: api.Archivo ?? '', 
    Formato: api.Perfil?.[0] ?? '',
    Alto: api.Alto ?? 0,
    Agujeros: api['Lista X (Agujeros)'] ?? '',
    Origen: api.Origen ?? 'Excel',
  };
}

export function toAPI(vm: Partial<DatosVM>): Partial<Datos> {
  return {
    id: vm.id!,
    _id: vm._id ?? null,
    TrabajoID: vm.TrabajoID!,
    Perfil: vm.Perfil!,
    Material: vm.Material!,
    Longitud: vm.Longitud!,
    Cantidad: vm.Cantidad!,
    Peso: vm.Peso!,
    Archivo: vm.Archivo!,
    Formato: vm.Formato!,
    Alto: vm.Alto!,
    Agujeros: vm.Agujeros!, 
  };
}
