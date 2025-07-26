
export type CreateSparePartDTO = {
  name: string;
  stock: number;
  marca: string;
  modelo: string;
  anio: number;
};

export type UpdateSparePartDTO = Partial<CreateSparePartDTO>;
