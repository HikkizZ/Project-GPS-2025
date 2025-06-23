import { AppDataSource } from "../../config/configDB.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { FichaEmpresa, EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { ServiceResponse } from "../../../types.js";
import { Not, DeepPartial } from "typeorm";
import { validateRut, formatRut } from "../../helpers/rut.helper.js";
import { normalizeText } from "../../helpers/normalizeText.helper.js";
import { ILike, Like } from "typeorm";
import { FindOptionsWhere } from "typeorm";
import { User } from "../../entity/user.entity.js";
import { HistorialLaboral } from "../../entity/recursosHumanos/historialLaboral.entity.js";
import { encryptPassword, comparePassword } from '../../utils/encrypt.js';
import { sendCredentialsEmail } from '../email.service.js';
import { userRole } from "../../../types.d.js";

// Generar contraseña segura de 8 a 16 caracteres
function generateRandomPassword(): string {
    const mayus = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const minus = 'abcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    const specials = '!@#$%^&*';  // Caracteres especiales comunes
    
    // Generar longitud aleatoria entre 10 y 16 caracteres (aumentamos el mínimo a 10)
    const length = Math.floor(Math.random() * 7) + 10;
    
    // Garantizar al menos uno de cada tipo en posiciones aleatorias
    const password = new Array(length).fill('');
    
    // Función auxiliar para obtener índices aleatorios no usados
    const getRandomEmptyIndex = () => {
        let index;
        do {
            index = Math.floor(Math.random() * length);
        } while (password[index] !== '');
        return index;
    };
    
    // Insertar caracteres requeridos en posiciones aleatorias
    password[getRandomEmptyIndex()] = mayus[Math.floor(Math.random() * mayus.length)];
    password[getRandomEmptyIndex()] = minus[Math.floor(Math.random() * minus.length)];
    password[getRandomEmptyIndex()] = nums[Math.floor(Math.random() * nums.length)];
    password[getRandomEmptyIndex()] = specials[Math.floor(Math.random() * specials.length)];
    
    // Llenar el resto con caracteres aleatorios
    const all = mayus + minus + nums + specials;
    for (let i = 0; i < length; i++) {
        if (password[i] === '') {
            password[i] = all[Math.floor(Math.random() * all.length)];
        }
    }
    
    return password.join('');
}

// Función para generar correo corporativo y manejar duplicados
async function generateCorporateEmail(primerNombre: string, apellidoPaterno: string): Promise<string> {
    const userRepo = AppDataSource.getRepository(User);
    const baseEmail = `${primerNombre}.${apellidoPaterno}@lamas.com`;
    
    // Verificar si el correo base ya existe
    let existingUser = await userRepo.findOne({ where: { email: baseEmail } });
    if (!existingUser) {
        return baseEmail;
    }

    // Si existe, buscar el último número usado
    let counter = 1;
    let newEmail = `${primerNombre}.${apellidoPaterno}${counter}@lamas.com`;
    
    while (await userRepo.findOne({ where: { email: newEmail } })) {
        counter++;
        newEmail = `${primerNombre}.${apellidoPaterno}${counter}@lamas.com`;
    }
    
    return newEmail;
}

export async function createTrabajadorService(trabajadorData: Partial<Trabajador>): Promise<ServiceResponse<{ trabajador: Trabajador, tempPassword: string, advertencias: string[], correoUsuario: string }>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const fichaRepo = AppDataSource.getRepository(FichaEmpresa);
        const userRepo = AppDataSource.getRepository(User);

        // Validar datos requeridos
        if (!trabajadorData.rut || !trabajadorData.nombres || !trabajadorData.apellidoPaterno || 
            !trabajadorData.apellidoMaterno || !trabajadorData.telefono || !trabajadorData.correoPersonal || 
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

        // Formatear el RUT antes de guardarlo (con puntos y guión)
        trabajadorData.rut = formatRut(trabajadorData.rut);

        // Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trabajadorData.correoPersonal)) {
            return [null, "Formato de correo personal inválido"];
        }

        // Validar formato de teléfono (debe tener entre 9 y 12 dígitos)
        const phoneRegex = /^\+?[\d]{9,12}$/;
        if (!phoneRegex.test(trabajadorData.telefono)) {
            return [null, "Formato de teléfono inválido"];
        }

        // Verificar si ya existe un trabajador con el mismo RUT
        const existingTrabajador = await trabajadorRepo.findOne({
            where: { rut: trabajadorData.rut }
        });

        if (existingTrabajador) {
            return [null, "Ya existe un trabajador con ese RUT"];
        }

        // Verificar si ya existe un usuario con el mismo RUT
        const existingUser = await userRepo.findOne({
            where: { rut: trabajadorData.rut }
        });

        if (existingUser) {
            return [null, "Ya existe un usuario con ese RUT"];
        }

        // Crear el trabajador
        const trabajador = trabajadorRepo.create({
            ...trabajadorData,
            enSistema: true
        });

        // Usar una transacción para asegurar que todo se crea o nada se crea
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Guardar el trabajador
            const trabajadorGuardado = await queryRunner.manager.save(Trabajador, trabajador);

            // Generar correo corporativo
            const primerNombre = trabajador.nombres.split(' ')[0].toLowerCase().normalize('NFD').replace(/[^a-zA-Z]/g, '');
            const apellidoPaterno = trabajador.apellidoPaterno.toLowerCase().normalize('NFD').replace(/[^a-zA-Z]/g, '');
            const correoUsuario = await generateCorporateEmail(primerNombre, apellidoPaterno);

            // Crear usuario automáticamente
            const randomPassword = generateRandomPassword();
            const hashedPassword = await encryptPassword(randomPassword);
            const newUser = queryRunner.manager.create(User, {
                name: `${trabajador.nombres} ${trabajador.apellidoPaterno} ${trabajador.apellidoMaterno}`,
                email: correoUsuario,
                password: hashedPassword,
                role: "Usuario" as userRole,
                rut: trabajador.rut,
                estadoCuenta: "Activa",
                createAt: new Date(),
                updateAt: new Date()
            });
            await queryRunner.manager.save(User, newUser);

            // Enviar correo con credenciales (excepto superadmin)
            let advertencias: string[] = [];
            if (!(trabajador.rut === "11.111.111-1")) {
                try {
                    await sendCredentialsEmail({
                        to: trabajador.correoPersonal,
                        nombre: trabajador.nombres,
                        correoUsuario,
                        passwordTemporal: randomPassword
                    });
                } catch (err) {
                    console.error("Error enviando correo de credenciales:", err);
                    advertencias.push("No se pudo enviar el correo de credenciales.");
                }
            }

            // Crear ficha de empresa
            const fichaEmpresa = queryRunner.manager.create(FichaEmpresa, {
                cargo: "Por Definir",
                area: "Por Definir",
                tipoContrato: "Por Definir",
                jornadaLaboral: "Por Definir",
                sueldoBase: 0,
                trabajador: trabajadorGuardado,
                estado: EstadoLaboral.ACTIVO,
                fechaInicioContrato: trabajadorGuardado.fechaIngreso
            });
            await queryRunner.manager.save(FichaEmpresa, fichaEmpresa);

            // Confirmar la transacción
            await queryRunner.commitTransaction();

            // Recargar el trabajador con sus relaciones
            const trabajadorCompleto = await trabajadorRepo.findOne({
                where: { id: trabajadorGuardado.id },
                relations: ["fichaEmpresa"]
            });

            if (!trabajadorCompleto) {
                throw new Error("No se pudo cargar el trabajador después de crearlo");
            }

            return [{ 
                trabajador: trabajadorCompleto, 
                tempPassword: randomPassword, 
                advertencias,
                correoUsuario 
            }, null];

        } catch (error) {
            // Si hay cualquier error, revertir todo
            await queryRunner.rollbackTransaction();
            console.error("Error en la transacción:", error);
            return [null, "Error al crear el trabajador y sus registros asociados"];
        } finally {
            // Liberar el queryRunner
            await queryRunner.release();
        }
    } catch (error) {
        console.error("Error en createTrabajadorService:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getTrabajadoresService(incluirInactivos: boolean = false): Promise<ServiceResponse<Trabajador[]>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const trabajadores = await trabajadorRepo.find({
            relations: ["usuario", "fichaEmpresa", "historialLaboral", "licenciasPermisos"],
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
        
        // Usar QueryBuilder para mayor flexibilidad en la búsqueda por RUT
        let queryBuilder = trabajadorRepo.createQueryBuilder("trabajador")
            .leftJoinAndSelect("trabajador.fichaEmpresa", "fichaEmpresa")
            .leftJoinAndSelect("trabajador.historialLaboral", "historialLaboral")
            .leftJoinAndSelect("trabajador.licenciasPermisos", "licenciasPermisos");

        // Aplicar filtros
        const conditions: string[] = [];
        const parameters: any = {};

        // Filtro especial para RUT que funciona con y sin puntos
        if (query.rut) {
            const rutOriginal = query.rut;
            const rutSinPuntos = query.rut.replace(/\./g, '');
            conditions.push("(trabajador.rut ILIKE :rutOriginal OR trabajador.rut ILIKE :rutSinPuntos)");
            parameters.rutOriginal = `%${rutOriginal}%`;
            parameters.rutSinPuntos = `%${rutSinPuntos}%`;
        }

        if (query.nombres) {
            conditions.push("trabajador.nombres ILIKE :nombres");
            parameters.nombres = `%${query.nombres}%`;
        }
        if (query.apellidoPaterno) {
            conditions.push("trabajador.apellidoPaterno ILIKE :apellidoPaterno");
            parameters.apellidoPaterno = `%${query.apellidoPaterno}%`;
        }
        if (query.apellidoMaterno) {
            conditions.push("trabajador.apellidoMaterno ILIKE :apellidoMaterno");
            parameters.apellidoMaterno = `%${query.apellidoMaterno}%`;
        }
        if (query.correoPersonal) {
            conditions.push("trabajador.correoPersonal ILIKE :correoPersonal");
            parameters.correoPersonal = `%${query.correoPersonal}%`;
        }
        if (query.telefono) {
            conditions.push("trabajador.telefono ILIKE :telefono");
            parameters.telefono = `%${query.telefono}%`;
        }
        if (query.numeroEmergencia) {
            conditions.push("trabajador.numeroEmergencia ILIKE :numeroEmergencia");
            parameters.numeroEmergencia = `%${query.numeroEmergencia}%`;
        }
        if (query.direccion) {
            // Búsqueda insensible a tildes y mayúsculas para dirección
            const direccionNormalizada = normalizeText(query.direccion);
            conditions.push("LOWER(TRANSLATE(trabajador.direccion, 'ÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÄËÏÖÜÑÇ', 'aeiouaeiouaeiouaeiounç')) ILIKE :direccion");
            parameters.direccion = `%${direccionNormalizada}%`;
        }
        if (query.fechaNacimiento) {
            conditions.push("trabajador.fechaNacimiento = :fechaNacimiento");
            parameters.fechaNacimiento = query.fechaNacimiento;
        }
        if (query.fechaIngreso) {
            conditions.push("trabajador.fechaIngreso = :fechaIngreso");
            parameters.fechaIngreso = query.fechaIngreso;
        }

        // Filtro de estado
        const soloEliminados = query.soloEliminados === true || query.soloEliminados === "true";
        const todos = query.todos === true || query.todos === "true";

        if (soloEliminados) {
            conditions.push("trabajador.enSistema = :enSistema");
            parameters.enSistema = false;
        } else if (!todos) {
            conditions.push("trabajador.enSistema = :enSistema");
            parameters.enSistema = true;
        }

        // Aplicar todas las condiciones
        if (conditions.length > 0) {
            queryBuilder = queryBuilder.where(conditions.join(" AND "), parameters);
        }

        const trabajadores = await queryBuilder.getMany();

        if (!trabajadores.length) {
            return [null, "No se encontraron trabajadores"];
        }

        return [trabajadores, null];
    } catch (error) {
        console.error("Error en searchTrabajadoresService:", error);
        return [null, "Error interno del servidor"];
    }
}

// Desvincular trabajador: soft delete, ficha en estado desvinculado, usuario inactivo
export async function desvincularTrabajadorService(id: number, motivo: string, userId?: number): Promise<ServiceResponse<Trabajador>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const trabajador = await queryRunner.manager.findOne(Trabajador, { 
            where: { id, enSistema: true }, 
            relations: ["fichaEmpresa", "usuario"] 
        });
        
        if (!trabajador) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, "Trabajador no encontrado o ya desvinculado"];
        }

        if (trabajador.rut === "11.111.111-1") {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, "No se puede modificar, eliminar ni desvincular al superadministrador."];
        }

        // Soft delete del trabajador
        trabajador.enSistema = false;
        await queryRunner.manager.save(Trabajador, trabajador);

        // Desactivar usuario asociado
        if (trabajador.usuario) {
            trabajador.usuario.estadoCuenta = "Inactiva";
            await queryRunner.manager.save(User, trabajador.usuario);
        }

        // Actualizar ficha de empresa
        if (trabajador.fichaEmpresa) {
            trabajador.fichaEmpresa.estado = EstadoLaboral.DESVINCULADO;
            trabajador.fichaEmpresa.fechaFinContrato = new Date();
            trabajador.fichaEmpresa.motivoDesvinculacion = motivo;
            await queryRunner.manager.save(FichaEmpresa, trabajador.fichaEmpresa);
        }

        await queryRunner.commitTransaction();
        await queryRunner.release();
        return [trabajador, null];
    } catch (error) {
        console.error("Error en desvincularTrabajadorService:", error);
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        return [null, "Error interno del servidor"];
    }
}

// Actualizar trabajador: permite actualizar campos permitidos y sincroniza con usuario
export async function updateTrabajadorService(id: number, data: any): Promise<ServiceResponse<Trabajador>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const userRepo = AppDataSource.getRepository(User);
        const trabajador = await trabajadorRepo.findOne({ 
            where: { id }, 
            relations: ["usuario", "fichaEmpresa"] 
        });

        if (!trabajador) return [null, "Trabajador no encontrado"];
        if (!trabajador.usuario) return [null, "El trabajador no tiene usuario asociado"];

        if (trabajador.rut === "11.111.111-1") {
            return [null, "No se puede modificar, eliminar ni desvincular al superadministrador."];
        }

        let updated = false;
        let correoUsuarioAnterior = trabajador.usuario.email;
        let correoPersonalAnterior = trabajador.correoPersonal;

        // Actualizar campos permitidos del trabajador
        const camposPermitidos = [
            "nombres", "apellidoPaterno", "apellidoMaterno", "telefono", 
            "numeroEmergencia", "direccion", "correoPersonal"
        ];
        
        for (const campo of camposPermitidos) {
            if (data[campo] && data[campo] !== (trabajador as any)[campo]) {
                (trabajador as any)[campo] = data[campo];
                updated = true;
            }
        }

        // Si se actualiza el nombre o apellidoPaterno, actualizar el correo de usuario automáticamente
        if (data.nombres || data.apellidoPaterno) {
            const primerNombre = (data.nombres || trabajador.nombres).split(' ')[0].toLowerCase().normalize('NFD').replace(/[^a-zA-Z]/g, '');
            const apellidoPaterno = (data.apellidoPaterno || trabajador.apellidoPaterno).toLowerCase().normalize('NFD').replace(/[^a-zA-Z]/g, '');
            const nuevoCorreoUsuario = await generateCorporateEmail(primerNombre, apellidoPaterno);
            trabajador.usuario.email = nuevoCorreoUsuario;
            updated = true;
        }

        // Si se actualiza el nombre o apellidos, actualizar el campo name en usuario
        if (data.nombres || data.apellidoPaterno || data.apellidoMaterno) {
            trabajador.usuario.name = `${data.nombres || trabajador.nombres} ${data.apellidoPaterno || trabajador.apellidoPaterno} ${data.apellidoMaterno || trabajador.apellidoMaterno}`;
            updated = true;
        }

        // Registrar cambios en historial laboral
        const historialRepo = AppDataSource.getRepository(HistorialLaboral);
        const cambios: string[] = [];
        
        if (data.nombres && data.nombres !== trabajador.nombres) {
            cambios.push(`Cambio de nombres: de "${trabajador.nombres}" a "${data.nombres}"`);
        }
        if (data.apellidoPaterno && data.apellidoPaterno !== trabajador.apellidoPaterno) {
            cambios.push(`Cambio de apellido paterno: de "${trabajador.apellidoPaterno}" a "${data.apellidoPaterno}"`);
        }
        if (data.apellidoMaterno && data.apellidoMaterno !== trabajador.apellidoMaterno) {
            cambios.push(`Cambio de apellido materno: de "${trabajador.apellidoMaterno}" a "${data.apellidoMaterno}"`);
        }
        if (data.correoPersonal && data.correoPersonal !== correoPersonalAnterior) {
            cambios.push(`Cambio de correo personal: de "${correoPersonalAnterior}" a "${data.correoPersonal}"`);
        }

        if (cambios.length > 0) {
            await historialRepo.save(historialRepo.create({
                trabajador: trabajador,
                cargo: 'Actualización de datos personales',
                area: 'N/A',
                departamento: 'N/A',
                tipoContrato: 'N/A',
                sueldoBase: 0,
                fechaInicio: new Date(),
                observaciones: cambios.join(' | '),
                registradoPor: data.registradoPor || null
            }));
        }

        // Guardar cambios en trabajador y usuario
        if (updated) {
            await trabajadorRepo.save(trabajador);
            await userRepo.save(trabajador.usuario);
        }

        // Devolver el trabajador actualizado con relaciones
        const trabajadorActualizado = await trabajadorRepo.findOne({ 
            where: { id }, 
            relations: ["usuario", "fichaEmpresa"] 
        });
        
        return [trabajadorActualizado, null];
    } catch (error) {
        console.error("Error en updateTrabajadorService:", error);
        return [null, "Error interno del servidor"];
    }
}