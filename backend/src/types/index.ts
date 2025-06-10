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

/* Inventory entry DTOs */
/* Header-level data for inventory entry */
export type CreateInventoryEntryDTO = {
  supplierRut: string;
  details: InventoryEntryDetailDTO[];
};

/* Detail-level data for each product in the entry */
export type InventoryEntryDetailDTO = {
  productId: number;
  quantity: number;
  purchasePrice: number;
};

/* Inventory exit DTOs */
/* Header-level data for inventory exit */
export type CreateInventoryExitDTO = {
  customerRut: string;
  details: InventoryExitDetailDTO[];
};

/* Detail-level data for each product in the exit */
export type InventoryExitDetailDTO = {
  productId: number;
  quantity: number;
};
