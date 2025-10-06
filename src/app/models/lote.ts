export interface Lote {
  _id: string;
  NombreTrabajo: string;
  FechaCreacion: string;
  UltimaEdicion: string;
  CreadoPor: string;
  UserID?: string[];
  Organizacion?: string;
  OrganizacionID?: string;
  FolderID: string;
  piezas_count: number;
  cubiertos_count: number;
  no_cubiertos_count: number;
  acciones?: string;
}