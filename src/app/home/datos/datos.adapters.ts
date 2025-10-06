import { Datos } from '../../models/datos';

export interface DatosVM {
    id: number;           // índice local para la fila (Material Table)
    _id?: string | null;  // id real del backend (Mongo, etc.)
    trabajoID: string;
    archivo: string;
    cara: string;
    perfil: string;
    calidad: string;
    longitud: number;
    cantidad: number;
    peso: number;
    coordenadas: string;
    "lista X (Agujeros)": string;
    material: string;
}

export function toVM(api: Datos, idx?: number): DatosVM {
  return {
    id: idx ?? api.id,
    _id: api._id ?? null,  
    trabajoID: api.TrabajoID ?? '',
    archivo: api.Archivo ?? '',
    cara: api.Cara ?? '',
    perfil: api.Perfil ?? '',  
    calidad: api.Calidad ?? '',
    longitud: api.Longitud ?? 0,
    cantidad: api.Cantidad ?? 0,
    peso: api.Peso ?? 0,
    coordenadas: api.Coordenadas ?? '',
    "lista X (Agujeros)": api['Lista X (Agujeros)'] ?? '',
    material: api.Material ?? ''
  };
}

export function toAPI(vm: Partial<DatosVM>): Partial<Datos> {
  return {
    id: vm.id!,
    _id: vm._id ?? null,
    TrabajoID: vm.trabajoID!,
    Archivo: vm.archivo!,
    Cara: vm.cara!,
    Perfil: vm.perfil!,
    Calidad: vm.calidad!,
    Longitud: vm.longitud!,
    Cantidad: vm.cantidad!,
    Peso: vm.peso!,
    Coordenadas: vm.coordenadas!,
    'Lista X (Agujeros)': vm['lista X (Agujeros)']!,
    Material: vm.material!,
  };
}
