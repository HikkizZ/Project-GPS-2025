import { AppDataSource } from "../../config/configDB.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { FichaEmpresa, EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { ServiceResponse } from "../../../types.js";
import { Not, DeepPartial } from "typeorm";
import { validateRut } from "../../helpers/rut.helper.js";
import { ILike, Like } from "typeorm";
import { FindOptionsWhere } from "typeorm";
import { User } from "../../entity/user.entity.js";
import { HistorialLaboral } from "../../entity/recursosHumanos/historialLaboral.entity.js";
import { encryptPassword } from "../../helpers/bcrypt.helper.js";
import { Between } from "typeorm";

// Función para generar una contraseña de exactamente 8 caracteres
function generateRandomPassword(): string {
    const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return password;
}

export async function createTrabajadorService(trabajadorData: Partial<Trabajador>): Promise<ServiceResponse<Trabajador>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const fichaRepo = AppDataSource.getRepository(FichaEmpresa);
        const userRepo = AppDataSource.getRepository(User);

        // Validar datos requeridos
        if (!trabajadorData.rut || !trabajadorData.nombres || !trabajadorData.apellidoPaterno || 
            !trabajadorData.apellidoMaterno || !trabajadorData.telefono || !trabajadorData.correo || 
            !trabajadorData.direccion) {
            return [null, "Faltan campos requeridos"];
        }

        // Establecer la fecha de ingreso al día actual
        // Forzar la zona horaria a Chile/Santiago
        process.env.TZ = 'America/Santiago';
        const now = new Date();
        // Formatear la fecha en el formato YYYY-MM-DD que espera PostgreSQL
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        trabajadorData.fechaIngreso = new Date(`${year}-${month}-${day}T12:00:00`);

        // Validar formato de RUT usando el helper
        if (!validateRut(trabajadorData.rut)) {
            return [null, "Formato de RUT inválido"];
        }

        // Limpiar el RUT antes de guardarlo (remover puntos pero mantener el guión)
        trabajadorData.rut = trabajadorData.rut.replace(/\./g, '');

        // Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trabajadorData.correo)) {
            return [null, "Formato de correo inválido"];
        }

        // Validar formato de teléfono (debe tener entre 9 y 12 dígitos)
        const phoneRegex = /^\+?[\d]{9,12}$/;
        if (!phoneRegex.test(trabajadorData.telefono)) {
            return [null, "Formato de teléfono inválido"];
        }

        // Verificar si ya existe un trabajador con el mismo RUT o correo
        const existingTrabajador = await trabajadorRepo.findOne({
            where: [
                { rut: trabajadorData.rut },
                { correo: trabajadorData.correo }
            ]
        });

        if (existingTrabajador) {
            if (existingTrabajador.rut === trabajadorData.rut) {
                return [null, "Ya existe un trabajador con ese RUT"];
            }
            if (existingTrabajador.correo === trabajadorData.correo) {
                return [null, "Ya existe un trabajador con ese correo"];
            }
        }

        // Verificar si ya existe un usuario con el mismo RUT o correo
        const existingUser = await userRepo.findOne({
            where: [
                { rut: trabajadorData.rut },
                { email: trabajadorData.correo }
            ]
        });

        if (existingUser) {
            if (existingUser.rut === trabajadorData.rut) {
                return [null, "Ya existe un usuario con ese RUT"];
            }
            if (existingUser.email === trabajadorData.correo) {
                return [null, "Ya existe un usuario con ese correo"];
            }
        }

        // Crear el trabajador
        const trabajador = trabajadorRepo.create({
            ...trabajadorData,
            enSistema: true
        });
        const trabajadorGuardado = await trabajadorRepo.save(trabajador);

        // Crear usuario automáticamente
        const randomPassword = generateRandomPassword();
        const hashedPassword = await encryptPassword(randomPassword);
        
        const newUser = userRepo.create({
            name: `${trabajadorData.nombres} ${trabajadorData.apellidoPaterno} ${trabajadorData.apellidoMaterno}`,
            rut: trabajadorData.rut,
            email: trabajadorData.correo,
            password: hashedPassword,
            originalPassword: randomPassword,
            role: "Usuario",
            trabajador: trabajadorGuardado
        });

        await userRepo.save(newUser);

        // SIEMPRE crear la ficha de empresa con valores por defecto
        const fichaData: DeepPartial<FichaEmpresa> = {
            cargo: trabajadorData.fichaEmpresa?.cargo ?? "Sin cargo",
            area: trabajadorData.fichaEmpresa?.area ?? "Sin área", 
            empresa: trabajadorData.fichaEmpresa?.empresa ?? "GPS",
            tipoContrato: trabajadorData.fichaEmpresa?.tipoContrato ?? "Indefinido",
            jornadaLaboral: trabajadorData.fichaEmpresa?.jornadaLaboral ?? "Por definir",
            sueldoBase: trabajadorData.fichaEmpresa?.sueldoBase ?? 0,
            trabajador: trabajadorGuardado,
            estado: EstadoLaboral.ACTIVO,
            fechaInicioContrato: trabajadorGuardado.fechaIngreso,
            contratoURL: trabajadorData.fichaEmpresa?.contratoURL
        };

        const ficha = fichaRepo.create(fichaData);
        const fichaGuardada = await fichaRepo.save(ficha);

        // Actualizar el trabajador con la referencia a la ficha
        trabajadorGuardado.fichaEmpresa = fichaGuardada;
        await trabajadorRepo.save(trabajadorGuardado);

        // Recargar el trabajador con todas sus relaciones
        const trabajadorCompleto = await trabajadorRepo.findOne({
            where: { id: trabajadorGuardado.id },
            relations: ["fichaEmpresa", "usuario"]
        });

        if (!trabajadorCompleto) {
            throw new Error("No se pudo recargar el trabajador después de crear la ficha");
        }

        // Asegurarnos de que la ficha esté cargada
        if (!trabajadorCompleto.fichaEmpresa) {
            throw new Error("No se pudo cargar la ficha de empresa del trabajador");
        }

        // Devolver la contraseña generada junto con el trabajador
        return [{ ...trabajadorCompleto, tempPassword: randomPassword }, null];
    } catch (error) {
        console.error("Error en createTrabajadorService:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getTrabajadoresService(incluirInactivos: boolean = false): Promise<ServiceResponse<Trabajador[]>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const trabajadores = await trabajadorRepo.find({
            relations: ["fichaEmpresa", "historialLaboral", "licenciasPermisos", "capacitaciones"],
            where: incluirInactivos ? {} : { enSistema: true }
        });

        if (!trabajadores.length) {
            return [null, "No hay trabajadores registrados"];
        }

        return [trabajadores, null];
    } catch (error) {
        console.error("Error en getTrabajadoresService:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function searchTrabajadoresService(query: any): Promise<ServiceResponse<Trabajador[]>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        
        // Construir where clause
        const whereClause: any = {};
        
        // Campos de identificación
        if (query.rut) whereClause.rut = ILike(`%${query.rut.replace(/\./g, '')}%`); // Remover puntos del RUT
        if (query.nombres) whereClause.nombres = ILike(`%${query.nombres}%`);
        if (query.apellidoPaterno) whereClause.apellidoPaterno = ILike(`%${query.apellidoPaterno}%`);
        if (query.apellidoMaterno) whereClause.apellidoMaterno = ILike(`%${query.apellidoMaterno}%`);
        
        // Campos de contacto
        if (query.correo) whereClause.correo = ILike(`%${query.correo}%`);
        if (query.telefono) whereClause.telefono = ILike(`%${query.telefono}%`);
        if (query.numeroEmergencia) whereClause.numeroEmergencia = ILike(`%${query.numeroEmergencia}%`);
        if (query.direccion) whereClause.direccion = ILike(`%${query.direccion}%`);
        
        // Campos de fechas
        if (query.fechaNacimiento) {
            whereClause.fechaNacimiento = query.fechaNacimiento;
        }
        if (query.fechaIngreso) {
            // Comparar directamente el string YYYY-MM-DD para evitar desfases
            whereClause.fechaIngreso = query.fechaIngreso;
        }
        
        // Manejar el filtro de estado del sistema
        if (query.soloEliminados === true || query.soloEliminados === 'true') {
            whereClause.enSistema = false;
        } else if (query.todos !== true && query.todos !== 'true') {
            whereClause.enSistema = true;
        }
        // Si query.todos es true, no agregamos ningún filtro de enSistema

        console.log('Query recibida:', query);
        console.log('Where clause generada:', whereClause);

        const trabajadores = await trabajadorRepo.find({
            where: whereClause,
            relations: ["fichaEmpresa", "historialLaboral", "licenciasPermisos", "capacitaciones"]
        });

        console.log('Trabajadores encontrados:', trabajadores.length);
        return [trabajadores, null];
    } catch (error) {
        console.error("Error en searchTrabajadoresService:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function updateTrabajadorService(id: number, trabajadorData: Partial<Trabajador>): Promise<ServiceResponse<Trabajador>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const userRepo = AppDataSource.getRepository(User);
        
        // Buscar el trabajador
        const trabajador = await trabajadorRepo.findOne({
            where: { id, enSistema: true },
            relations: ["usuario"]
        });

        if (!trabajador) {
            return [null, "Trabajador no encontrado"];
        }

        // Si se está actualizando el RUT o correo, verificar que no exista otro trabajador con esos datos
        if (trabajadorData.rut || trabajadorData.correo) {
            const existingTrabajador = await trabajadorRepo.findOne({
                where: [
                    { rut: trabajadorData.rut || "", id: Not(id) },
                    { correo: trabajadorData.correo || "", id: Not(id) }
                ]
            });

            if (existingTrabajador) {
                return [null, "Ya existe un trabajador con ese RUT o correo"];
            }
        }

        // Actualizar campos del trabajador
        Object.assign(trabajador, trabajadorData);
        const trabajadorActualizado = await trabajadorRepo.save(trabajador);

        // Si se actualizaron los nombres, actualizar también el nombre del usuario
        if (trabajadorData.nombres || trabajadorData.apellidoPaterno || trabajadorData.apellidoMaterno) {
            const nombreCompleto = `${trabajadorData.nombres || trabajador.nombres} ${trabajadorData.apellidoPaterno || trabajador.apellidoPaterno} ${trabajadorData.apellidoMaterno || trabajador.apellidoMaterno}`.trim();
            
            if (trabajador.usuario) {
                trabajador.usuario.name = nombreCompleto;
                await userRepo.save(trabajador.usuario);
            }
        }

        return [trabajadorActualizado, null];
    } catch (error) {
        console.error("Error en updateTrabajadorService:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function deleteTrabajadorService(id: number): Promise<ServiceResponse<boolean>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const userRepo = AppDataSource.getRepository(User);

        // Buscar el trabajador con su usuario asociado
        const trabajador = await trabajadorRepo.findOne({
            where: { id, enSistema: true },
            relations: ["usuario"]
        });

        if (!trabajador) {
            return [null, "Trabajador no encontrado"];
        }

        // En lugar de eliminar, marcamos como inactivo
        trabajador.enSistema = false;
        await trabajadorRepo.save(trabajador);

        // Si el trabajador tiene un usuario asociado, eliminarlo
        if (trabajador.usuario) {
            // No eliminar al administrador principal
            if (trabajador.usuario.role === "Administrador" && trabajador.usuario.rut === "11.111.111-1") {
                return [null, "No se puede eliminar el administrador principal"];
            }

            await userRepo.remove(trabajador.usuario);
        }

        return [true, null];
    } catch (error) {
        console.error("Error en deleteTrabajadorService:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function desvincularTrabajadorService(
    id: number,
    motivo: string,
    userId?: number
): Promise<ServiceResponse<Trabajador>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        // 1. Obtener el trabajador con sus relaciones
        const trabajador = await queryRunner.manager.findOne(Trabajador, {
            where: { id, enSistema: true },
            relations: ["fichaEmpresa", "usuario"]
        });

        if (!trabajador) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, "Trabajador no encontrado o ya desvinculado"];
        }

        console.log('Estado inicial de la ficha:', trabajador.fichaEmpresa?.estado);

        // 2. Actualizar el estado del trabajador
        trabajador.enSistema = false;
        await queryRunner.manager.save(Trabajador, trabajador);

        // 3. Actualizar el estado de la cuenta de usuario si existe
        if (trabajador.usuario) {
            const usuario = await queryRunner.manager.findOne(User, {
                where: { rut: trabajador.rut }
            });
            if (usuario) {
                usuario.estadoCuenta = "Inactiva";
                await queryRunner.manager.save(User, usuario);
            }
        }

        // 4. Actualizar el estado de la ficha de empresa
        if (trabajador.fichaEmpresa) {
            const fichaRepo = queryRunner.manager.getRepository(FichaEmpresa);
            const ficha = await fichaRepo.findOne({
                where: { id: trabajador.fichaEmpresa.id }
            });

            if (ficha) {
                ficha.estado = EstadoLaboral.DESVINCULADO;
                ficha.fechaFinContrato = new Date();
                ficha.motivoDesvinculacion = motivo;
                await queryRunner.manager.save(FichaEmpresa, ficha);
                console.log('Estado actualizado de la ficha:', ficha.estado);
            }
        }

        // 5. Registrar en el historial laboral
        const registrador = userId ? await queryRunner.manager.findOne(User, { where: { id: userId } }) : null;
        
        const historialLaboral = new HistorialLaboral();
        historialLaboral.trabajador = trabajador;
        historialLaboral.cargo = trabajador.fichaEmpresa?.cargo || "No especificado";
        historialLaboral.area = trabajador.fichaEmpresa?.area || "No especificada";
        historialLaboral.tipoContrato = trabajador.fichaEmpresa?.tipoContrato || "No especificado";
        historialLaboral.sueldoBase = trabajador.fichaEmpresa?.sueldoBase || 0;
        historialLaboral.fechaInicio = trabajador.fichaEmpresa?.fechaInicio || new Date().toISOString();
        historialLaboral.fechaFin = new Date().toISOString();
        historialLaboral.motivoTermino = motivo;
        historialLaboral.registradoPor = registrador;

        await queryRunner.manager.save(HistorialLaboral, historialLaboral);

        // 6. Commit de la transacción
        await queryRunner.commitTransaction();

        // 7. Verificar el estado final de la ficha
        const fichaFinal = await queryRunner.manager.findOne(FichaEmpresa, {
            where: { id: trabajador.fichaEmpresa?.id }
        });
        console.log('Estado final de la ficha después del commit:', fichaFinal?.estado);

        await queryRunner.release();

        // 8. Recargar el trabajador con todas sus relaciones actualizadas
        const trabajadorActualizado = await AppDataSource.getRepository(Trabajador).findOne({
            where: { id },
            relations: ["fichaEmpresa", "usuario"]
        });

        return [trabajadorActualizado || trabajador, null];
    } catch (error) {
        console.error("Error en desvincularTrabajadorService:", error);
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        return [null, "Error interno del servidor"];
    }
}