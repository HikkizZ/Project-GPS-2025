/* Product Types */
export enum ProductType {
    BASE_ESTABILIZADA = 'BASE_ESTABILIZADA',
    GRAVILLA = 'GRAVILLA',
    MAICILLO = 'MAICILLO',
    BOLON = 'BOLON',
    ARENA = 'ARENA',
    GRAVA = 'GRAVA',
    RIPIO = 'RIPIO',
    RELLENO = 'RELLENO'
}

/* Product DTOs (Data Transfer Objects) */
export type CreateProductDTO = {
  product: ProductType;
  salePrice: number;
};

export type UpdateProductDTO = Partial<CreateProductDTO>;
