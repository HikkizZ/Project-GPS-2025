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

/* Customer DTOs */
export type CreateCustomerDTO = {
    name: string;
    rut: string;
    address: string;
    phone: string;
    email: string;
};

export type UpdateCustomerDTO = Partial<CreateCustomerDTO>;

/* Supplier DTOs */
export type CreateSupplierDTO = {
    name: string;
    rut: string;
    address: string;
    phone: string;
    email: string;
};

export type UpdateSupplierDTO = Partial<CreateSupplierDTO>;
