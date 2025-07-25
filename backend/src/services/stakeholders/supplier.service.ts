import { Supplier } from '../../entity/stakeholders/supplier.entity.js';
import { AppDataSource } from '../../config/configDB.js';
import { CreateSupplierDTO, UpdateSupplierDTO } from '../../types/stakeholders/supplier.dto.js';
import { ServiceResponse, QueryParams } from '../../../types.js';
import { formatRut } from '../../helpers/rut.helper.js';

export async function getAllSuppliersService(): Promise<ServiceResponse<Supplier[]>> {
    try {
        const supplierRepository = AppDataSource.getRepository(Supplier);
        const suppliers = await supplierRepository.find({ where: { isActive: true } });

        return [suppliers, null];
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getSupplierService(query: QueryParams): Promise<ServiceResponse<Supplier>> {
    try {
        const { id, rut, email } = query;

        const rutFormatted = rut ? formatRut(rut) : undefined;

        const supplierRepository = AppDataSource.getRepository(Supplier);

        const supplierFound = await supplierRepository.findOne({ where: [{ id }, { rut: rutFormatted }, { email }] });

        if (!supplierFound) return [null, "El proveedor no existe."];

        return [supplierFound, null];
    } catch (error) {
        console.error("Error fetching supplier:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function createSupplierService(supplierData: CreateSupplierDTO): Promise<ServiceResponse<Supplier>> {
    try {
        const supplierRepository = AppDataSource.getRepository(Supplier);
        const rutFormatted = formatRut(supplierData.rut);

        const existingsupplier = await supplierRepository.findOne({ where: { rut: rutFormatted } });

        if (existingsupplier) {
            if (!existingsupplier.isActive) {
                existingsupplier.isActive = true;
                existingsupplier.name = supplierData.name;
                existingsupplier.email = supplierData.email;
                existingsupplier.phone = supplierData.phone;
                existingsupplier.address = supplierData.address;

                const reactivatedSupplier = await supplierRepository.save(existingsupplier);
                return [reactivatedSupplier, null];
            }

            return [null, "El proveedor ya existe y está activo."]; 
        }

        const newSupplier = supplierRepository.create({
            name: supplierData.name,
            rut: rutFormatted,
            email: supplierData.email,
            phone: supplierData.phone,
            address: supplierData.address
        });
        const savedSupplier = await supplierRepository.save(newSupplier);

        return [savedSupplier, null];
    } catch (error) {
        console.error("Error creating supplier:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function updateSupplierService(query: { id: number }, supplierData: UpdateSupplierDTO): Promise<ServiceResponse<Supplier>> {
    try {
        const { id } = query;

        const supplierRepository = AppDataSource.getRepository(Supplier);

        const supplierFound = await supplierRepository.findOne({ where: { id } });

        if (!supplierFound) return [null, "El proveedor no existe."];

        const formattedUpdateRut = supplierData.rut ? formatRut(supplierData.rut) : undefined;

        const updatedSupplier = await supplierRepository.save({
            ...supplierFound,
            ...supplierData,
            rut: formattedUpdateRut ?? supplierFound.rut,
        });

        return [updatedSupplier, null];
    } catch (error) {
        console.error("Error updating supplier:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function deleteSupplierService(query: { id: number }): Promise<ServiceResponse<Supplier>> {
    try {
        const { id } = query;

        const supplierRepository = AppDataSource.getRepository(Supplier);

        const supplierFound = await supplierRepository.findOne({ where: { id } });

        if (!supplierFound) return [null, "El proveedor no existe."];

        supplierFound.isActive = false;

        const updatedSupplier = await supplierRepository.save(supplierFound);

        return [updatedSupplier, null];
    } catch (error) {
        console.error("Error deleting supplier:", error);
        return [null, "Error interno del servidor"];
    }
}
