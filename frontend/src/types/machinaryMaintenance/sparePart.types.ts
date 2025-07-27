export interface SparePart {
  id: number;
  name: string;
  stock: number;
  marca: string;
  modelo: string;
  anio: number;
}

export interface CreateSparePartData {
  name: string;
  stock: number;
  marca: string;
  modelo: string;
  anio: number;
}

export interface UpdateSparePartData {
  name?: string;
  stock?: number;
  marca?: string;
  modelo?: string;
  anio?: number;
  modo?: 'editar' | 'agregarStock';
}
