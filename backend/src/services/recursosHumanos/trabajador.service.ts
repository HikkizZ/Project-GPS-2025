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
import { hashPassword } from '../../utils/password.utils.js';
import { sendCredentialsEmail } from '../../utils/email.service.js';

// Función para generar una contraseña de exactamente 8 caracteres
function generateRandomPassword(): string {
    const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return password;
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

export async function createTrabajadorService(trabajadorData: Partial<Trabajador>): Promise<ServiceResponse<{ trabajador: Trabajador, tempPassword: string, advertencias: string[] }>> {
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

        // Limpiar el RUT antes de guardarlo (remover puntos pero mantener el guión)
        trabajadorData.rut = trabajadorData.rut.replace(/\./g, '');

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

        // Verificar si ya existe un trabajador con el mismo RUT o correo
        const existingTrabajador = await trabajadorRepo.findOne({
            where: [
                { rut: trabajadorData.rut },
                { correoPersonal: trabajadorData.correoPersonal }
            ]
        });

        if (existingTrabajador) {
            if (existingTrabajador.rut === trabajadorData.rut) {
                return [null, "Ya existe un trabajador con ese RUT"];
            }
            // if (existingTrabajador.correoPersonal === trabajadorData.correoPersonal) {
            //     return [null, "Ya existe un trabajador con ese correo personal"];
            // }
        }

        // Verificar si ya existe un usuario con el mismo RUT o correo
        const existingUser = await userRepo.findOne({
            where: [
                { rut: trabajadorData.rut },
                { email: trabajadorData.correoPersonal }
            ]
        });

        if (existingUser) {
            if (existingUser.rut === trabajadorData.rut) {
                return [null, "Ya existe un usuario con ese RUT"];
            }
            // if (existingUser.email === trabajadorData.correoPersonal) {
            //     return [null, "Ya existe un usuario con ese correo personal"];
            // }
        }

        // Crear el trabajador
        const trabajador = trabajadorRepo.create({
            ...trabajadorData,
            enSistema: true
        });
        const trabajadorGuardado = await trabajadorRepo.save(trabajador);

        // Generar correo corporativo
        const primerNombre = trabajador.nombres.split(' ')[0].toLowerCase().normalize('NFD').replace(/[^a-zA-Z]/g, '');
        const apellidoPaterno = trabajador.apellidoPaterno.toLowerCase().normalize('NFD').replace(/[^a-zA-Z]/g, '');
        const correoUsuario = await generateCorporateEmail(primerNombre, apellidoPaterno);

        // Crear usuario automáticamente
        const randomPassword = generateRandomPassword();
        const hashedPassword = await encryptPassword(randomPassword);
        const newUser = userRepo.create({
            name: `${trabajador.nombres} ${trabajador.apellidoPaterno} ${trabajador.apellidoMaterno}`,
            email: correoUsuario,
            password: hashedPassword,
            role: "Usuario",
            rut: trabajador.rut,
            estadoCuenta: "Activa",
            createAt: new Date(),
            updateAt: new Date()
        });
        await userRepo.save(newUser);

        // Enviar correo con credenciales (excepto superadmin)
        let correoError = null;
        if (!(trabajador.rut === "20.882.865-7")) {
            try {
                await sendCredentialsEmail({
                    to: trabajador.correoPersonal,
                    nombre: trabajador.nombres,
                    correoUsuario,
                    passwordTemporal: randomPassword
                });
            } catch (err) {
                console.error("Error enviando correo de credenciales:", err);
                correoError = "Trabajador creado, pero no se pudo enviar el correo de credenciales.";
            }
        }

        // Crear ficha de empresa con manejo de error
        let fichaGuardada = null;
        let fichaError = null;
        try {
            const fichaData: DeepPartial<FichaEmpresa> = {
                cargo: trabajadorData.fichaEmpresa?.cargo ?? "Sin cargo",
                area: trabajadorData.fichaEmpresa?.area ?? "Sin área", 
                tipoContrato: trabajadorData.fichaEmpresa?.tipoContrato ?? "Por definir",
                jornadaLaboral: trabajadorData.fichaEmpresa?.jornadaLaboral ?? "Por definir",
                sueldoBase: trabajadorData.fichaEmpresa?.sueldoBase ?? 0,
                trabajador: trabajadorGuardado,
                estado: EstadoLaboral.ACTIVO,
                fechaInicioContrato: trabajadorGuardado.fechaIngreso,
                contratoURL: trabajadorData.fichaEmpresa?.contratoURL
            };
            const ficha = fichaRepo.create(fichaData);
            fichaGuardada = await fichaRepo.save(ficha);
            // Actualizar el trabajador con la referencia a la ficha
            trabajadorGuardado.fichaEmpresa = fichaGuardada;
            await trabajadorRepo.save(trabajadorGuardado);
        } catch (err) {
            console.error("Error creando ficha de empresa:", err);
            fichaError = "Trabajador creado, pero no se pudo crear la ficha de empresa.";
        }

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

        // Devolver la contraseña generada junto con el trabajador y advertencias si las hay
        let advertencias = [];
        if (correoError) advertencias.push(correoError);
        if (fichaError) advertencias.push(fichaError);
        return [{ trabajador: trabajadorCompleto, tempPassword: randomPassword, advertencias }, null];
    } catch (error) {
        console.error("Error en createTrabajadorService:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getTrabajadoresService(incluirInactivos: boolean = false): Promise<ServiceResponse<Trabajador[]>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const trabajadores = await trabajadorRepo.find({
            relations: ["usuario", "fichaEmpresa", "historialLaboral", "licenciasPermisos", "capacitaciones"],
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
        if (query.correoPersonal) whereClause.correoPersonal = ILike(`%${query.correoPersonal}%`);
        if (query.telefono) whereClause.telefono = ILike(`%${query.telefono}%`);

        const trabajadores = await trabajadorRepo.find({
            relations: ["fichaEmpresa", "historialLaboral", "licenciasPermisos", "capacitaciones"],
            where: whereClause
        });

        if (!trabajadores.length) {
            return [null, "No se encontraron trabajadores"];
        }

        return [trabajadores, null];
    } catch (error) {
        console.error("Error en searchTrabajadoresService:", error);
        return [null, "Error interno del servidor"];
    }
}

// Actualizar trabajador: permite actualizar campos permitidos y sincroniza con usuario
export async function updateTrabajadorService(id: number, data: any): Promise<ServiceResponse<Trabajador>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const userRepo = AppDataSource.getRepository(User);
        const trabajador = await trabajadorRepo.findOne({ where: { id }, relations: ["usuario", "fichaEmpresa"] });
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
            "nombres", "apellidoPaterno", "apellidoMaterno", "telefono", "numeroEmergencia", "direccion", "correoPersonal"
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
        if (
            data.nombres || data.apellidoPaterno || data.apellidoMaterno
        ) {
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
        const trabajadorActualizado = await trabajadorRepo.findOne({ where: { id }, relations: ["usuario", "fichaEmpresa"] });
        return [trabajadorActualizado, null];
    } catch (error) {
        console.error("Error en updateTrabajadorService:", error);
        return [null, "Error interno del servidor"];
    }
}

// Desvincular trabajador: soft delete, ficha en estado desvinculado, usuario inactivo
export async function desvincularTrabajadorService(id: number, motivo: string, userId?: number): Promise<ServiceResponse<Trabajador>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const trabajador = await queryRunner.manager.findOne(Trabajador, { where: { id, enSistema: true }, relations: ["fichaEmpresa", "usuario"] });
        if (!trabajador) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, "Trabajador no encontrado o ya desvinculado"];
        }
        if (trabajador.rut === "11.111.111-1") {
            return [null, "No se puede modificar, eliminar ni desvincular al superadministrador."];
        }
        trabajador.enSistema = false;
        await queryRunner.manager.save(Trabajador, trabajador);
        if (trabajador.usuario) {
            trabajador.usuario.estadoCuenta = "Inactiva";
            await queryRunner.manager.save(User, trabajador.usuario);
        }
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