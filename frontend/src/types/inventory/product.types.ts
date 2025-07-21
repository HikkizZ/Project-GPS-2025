export enum ProductType {
  BASE_ESTABILIZADA = 'Base Estabilizada',
  GRAVILLA = 'Gravilla',
  MAICILLO = 'Maicillo',
  BOLON = 'Bolón',
  ARENA = 'Arena',
  GRAVA = 'Grava',
  RIPIO = 'Ripio',
  RELLENO = 'Relleno'
}

export interface Product {
  id: number;
  product: ProductType;
  salePrice: number;
}

export interface CreateProductData {
  product: ProductType;
  salePrice: number;
}

export interface UpdateProductData {
  salePrice: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}