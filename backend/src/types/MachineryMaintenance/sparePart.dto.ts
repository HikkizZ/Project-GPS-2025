
export type CreateSparePartDTO = {
  name: string;
  stock: number;
  marca: string;
  modelo: string;
  anio: number;
  modo?: 'editar' | 'agregarStock';
};

export type UpdateSparePartDTO = Partial<CreateSparePartDTO>;
