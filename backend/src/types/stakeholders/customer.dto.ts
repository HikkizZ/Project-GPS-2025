/* Customer DTOs */
export type CreateCustomerDTO = {
    name: string;
    rut: string;
    address: string;
    phone: string;
    email: string;
};

export type UpdateCustomerDTO = Partial<CreateCustomerDTO>;