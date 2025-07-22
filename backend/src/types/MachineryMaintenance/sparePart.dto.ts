import { GrupoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js";

export type CreateSparePartDTO = {
  name: string;
  stock: number;
  marca: string;
  modelo: string;
  anio: number;
  grupo: GrupoMaquinaria;
};

export type UpdateSparePartDTO = Partial<CreateSparePartDTO>;
