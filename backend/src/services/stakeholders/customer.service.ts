import { Customer } from '../../entity/stakeholders/customer.entity.js';
import { AppDataSource } from '../../config/configDB.js';
import { CreateCustomerDTO, UpdateCustomerDTO } from '../../types/stakeholders/customer.dto.js';
import { ServiceResponse, QueryParams } from '../../../types.js';
import { formatRut } from '../../helpers/rut.helper.js';

export async function getAllCustomersService(): Promise<ServiceResponse<Customer[]>> {
    try {
        const customerRepository = AppDataSource.getRepository(Customer);
        const customers = await customerRepository.find({ where: { isActive: true } });

        return [customers, null];
    } catch (error) {
        console.error("Error fetching customers:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getCustomerService(query: QueryParams): Promise<ServiceResponse<Customer>> {
    try {
        const { id, rut, email } = query;

        const rutFormatted = rut ? formatRut(rut) : undefined;

        const customerRepository = AppDataSource.getRepository(Customer);

        const customerFound = await customerRepository.findOne({ where: [{ id }, { rut: rutFormatted }, { email }] });

        if (!customerFound) return [null, "El cliente no existe."];

        return [customerFound, null];
    } catch (error) {
        console.error("Error fetching customer:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function createCustomerService(customerData: CreateCustomerDTO): Promise<ServiceResponse<Customer>> {
    try {
        const customerRepository = AppDataSource.getRepository(Customer);
        const rutFormatted = formatRut(customerData.rut);

        const existingCustomer = await customerRepository.findOne({ where: { rut: rutFormatted } });

        if (existingCustomer) {
            if (!existingCustomer.isActive) {
                existingCustomer.isActive = true;
                existingCustomer.name = customerData.name;
                existingCustomer.email = customerData.email;
                existingCustomer.phone = customerData.phone;
                existingCustomer.address = customerData.address;

                const reactivatedCustomer = await customerRepository.save(existingCustomer);
                return [reactivatedCustomer, null];
            }

            return [null, "El cliente ya existe y está activo."];
        }

        const newCustomer = customerRepository.create({
            name: customerData.name,
            rut: rutFormatted,
            email: customerData.email,
            phone: customerData.phone,
            address: customerData.address
        });
        const savedCustomer = await customerRepository.save(newCustomer);

        return [savedCustomer, null];
    } catch (error) {
        console.error("Error creating customer:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function updateCustomerService(query: QueryParams, customerData: UpdateCustomerDTO): Promise<ServiceResponse<Customer>> {
    try {
        const { id } = query;

        const customerRepository = AppDataSource.getRepository(Customer);

        const customerFound = await customerRepository.findOne({ where: { id } });

        if (!customerFound) return [null, "El cliente no existe."];

        const formattedUpdateRut = customerData.rut ? formatRut(customerData.rut) : undefined;

        const updatedCustomer = await customerRepository.save({
            ...customerFound,
            ...customerData,
            rut: formattedUpdateRut ?? customerFound.rut
        });

        return [updatedCustomer, null];
    } catch (error) {
        console.error("Error updating customer:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function deleteCustomerService(query: QueryParams): Promise<ServiceResponse<Customer>> {
    try {
        const { id } = query;

        const customerRepository = AppDataSource.getRepository(Customer);

        const customerFound = await customerRepository.findOne({ where: { id } });

        if (!customerFound) return [null, "El cliente no existe."];

        customerFound.isActive = false;

        const updatedCustomer = await customerRepository.save(customerFound);

        return [updatedCustomer, null];
    } catch (error) {
        console.error("Error deleting customer:", error);
        return [null, "Error interno del servidor"];
    }
}
