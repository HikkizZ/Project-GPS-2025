import { GrupoMaquinaria } from '../maquinaria/maquinaria.types';

export interface SparePart {
  id: number;
  name: string;
  stock: number;
  marca: string;
  modelo: string;
  anio: number;
  grupo: GrupoMaquinaria;
}

export interface CreateSparePartData {
  name: string;
  stock: number;
  marca: string;
  modelo: string;
  anio: number;
  grupo: GrupoMaquinaria;
}

export interface UpdateSparePartData {
  name?: string;
  stock?: number;
  marca?: string;
  modelo?: string;
  anio?: number;
  grupo?: GrupoMaquinaria;
}
