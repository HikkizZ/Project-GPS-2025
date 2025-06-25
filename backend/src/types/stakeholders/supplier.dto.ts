/* Supplier DTOs */
export type CreateSupplierDTO = {
    name: string;
    rut: string;
    address: string;
    phone: string;
    email: string;
};

export type UpdateSupplierDTO = Partial<CreateSupplierDTO>;