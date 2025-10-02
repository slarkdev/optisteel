export interface Lotes {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  UserID?: string[];
  Organizacion?: string;
  OrganizacionID?: string;
  FolderID: string;
  piezas_count: number;
  cubiertos_count: number;
  no_cubiertos_count: number;
}
