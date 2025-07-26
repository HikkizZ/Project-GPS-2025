/* Product Types */
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

/* Product DTOs (Data Transfer Objects) */
export type CreateProductDTO = {
  product: ProductType;
  salePrice: number;
};

export type UpdateProductDTO = Partial<CreateProductDTO>;
