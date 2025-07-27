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

// Función para obtener todos los correos corporativos que han sido utilizados históricamente
async function getAllUsedCorporateEmails(primerNombre: string, apellidoPaterno: string, queryRunner?: any): Promise<string[]> {
    const userRepo = queryRunner ? queryRunner.manager.getRepository(User) : AppDataSource.getRepository(User);
    const historialRepo = queryRunner ? queryRunner.manager.getRepository(HistorialLaboral) : AppDataSource.getRepository(HistorialLaboral);
    
    const baseEmailPattern = `${primerNombre}.${apellidoPaterno}`;
    const allUsedEmails: Set<string> = new Set();
    
    // 1. Buscar en la tabla User (correos actuales)
    const pattern = `${baseEmailPattern}%@lamas.com`;
    const currentEmails = await userRepo
        .createQueryBuilder("user")
        .select("user.corporateEmail")
        .where("user.corporateEmail ILIKE :pattern", { pattern })
        .getMany();
    
    currentEmails.forEach((user: any) => {
        if (user.corporateEmail) {
            allUsedEmails.add(user.corporateEmail);
        }
    });
    
    // 2. Buscar en HistorialLaboral (correos históricos en observaciones)
    const historialEntries = await historialRepo
        .createQueryBuilder("historial")
        .select("historial.observaciones")
        .where("historial.observaciones ILIKE :pattern", { pattern: `%${baseEmailPattern}%@lamas.com%` })
        .getMany();
    
    // Extraer correos de las observaciones usando regex
    const emailRegex = new RegExp(`${baseEmailPattern}\\d*@lamas\\.com`, 'g');
    historialEntries.forEach((entry: any) => {
        if (entry.observaciones) {
            const matches = entry.observaciones.match(emailRegex);
            if (matches) {
                matches.forEach((email: string) => {
                    allUsedEmails.add(email);
                });
            }
        }
    });
    
    // 3. También buscar el correo base exacto en User (por si existe)
    const baseEmail = `${baseEmailPattern}@lamas.com`;
    const exactEmailExists = await userRepo
        .createQueryBuilder("user")
        .select("user.corporateEmail")
        .where("user.corporateEmail = :email", { email: baseEmail })
        .getOne();
    
    if (exactEmailExists && exactEmailExists.corporateEmail) {
        allUsedEmails.add(exactEmailExists.corporateEmail);
    }
    
    return Array.from(allUsedEmails);
}

// Función para generar correo corporativo y manejar duplicados - NUNCA reutilizar correos anteriores
async function generateCorporateEmail(primerNombre: string, apellidoPaterno: string, queryRunner?: any): Promise<string> {
    const baseEmail = `${primerNombre}.${apellidoPaterno}@lamas.com`;
    
    // Obtener TODOS los correos históricos (User + HistorialLaboral)
    const allUsedEmails = await getAllUsedCorporateEmails(primerNombre, apellidoPaterno, queryRunner);
    
    if (allUsedEmails.length === 0) {
        return baseEmail;
    }
    
    // Extraer todos los números usados
    const numbersUsed: number[] = [];
    const baseEmailPattern = `${primerNombre}.${apellidoPaterno}`;
    
    allUsedEmails.forEach((email: string) => {
        // Verificar si es el correo base sin número
        if (email === baseEmail) {
            numbersUsed.push(0); // Consideramos el base como "0"
        } else {
            // Extraer número del final del correo antes de @lamas.com
            const match = email.match(new RegExp(`${baseEmailPattern}(\\d+)@lamas\\.com$`));
            if (match) {
                const numero = parseInt(match[1]);
                numbersUsed.push(numero);
            }
        }
    });
    
    // Encontrar el siguiente número disponible (siempre el mayor + 1)
    const maxNumber = numbersUsed.length > 0 ? Math.max(...numbersUsed) : -1;
    const nextNumber = maxNumber + 1;
    
    // Si el número es 0, significa que solo existe el base, entonces usar 1
    if (nextNumber === 0) {
        return `${primerNombre}.${apellidoPaterno}1@lamas.com`;
    }
    
    return `${primerNombre}.${apellidoPaterno}${nextNumber}@lamas.com`;
}

// Función auxiliar para limpiar automáticamente los campos de texto
function limpiarCamposTexto(data: Partial<Trabajador>): Partial<Trabajador> {
    const dataCopia = { ...data };
    
    // Aplicar trim y eliminar espacios dobles en campos de nombres
    if (dataCopia.nombres) dataCopia.nombres = dataCopia.nombres.trim().replace(/\s+/g, ' ');
    if (dataCopia.apellidoPaterno) dataCopia.apellidoPaterno = dataCopia.apellidoPaterno.trim().replace(/\s+/g, ' ');
    if (dataCopia.apellidoMaterno) dataCopia.apellidoMaterno = dataCopia.apellidoMaterno.trim().replace(/\s+/g, ' ');
    if (dataCopia.telefono) dataCopia.telefono = dataCopia.telefono.trim();
    if (dataCopia.correoPersonal) dataCopia.correoPersonal = dataCopia.correoPersonal.trim();
    if (dataCopia.numeroEmergencia) {
        const numeroLimpio = dataCopia.numeroEmergencia.trim();
        dataCopia.numeroEmergencia = numeroLimpio === '' ? null : numeroLimpio;
    }
    if (dataCopia.direccion) dataCopia.direccion = dataCopia.direccion.trim().replace(/\s+/g, ' ');
    if (dataCopia.rut) dataCopia.rut = dataCopia.rut.trim();
    
    return dataCopia;
}

// Cambiar la firma para aceptar el usuario que registra
export async function createTrabajadorService(trabajadorData: Partial<Trabajador>, registradoPorUser?: User): Promise<ServiceResponse<{ trabajador: Trabajador, tempPassword: string, advertencias: string[], correoUsuario: string }>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const fichaRepo = AppDataSource.getRepository(FichaEmpresa);
        const userRepo = AppDataSource.getRepository(User);

        // LIMPIEZA AUTOMÁTICA: Eliminar espacios extra de todos los campos de texto
        trabajadorData = limpiarCamposTexto(trabajadorData);

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
        const emailPersonal = trabajadorData.correoPersonal ?? ""; // usa "" si es undefined o null

        if (!emailRegex.test(emailPersonal)) {
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
            
            const correoUsuario = await generateCorporateEmail(primerNombre, apellidoPaterno, queryRunner);

            // Crear usuario automáticamente
            const randomPassword = generateRandomPassword();
            const hashedPassword = await encryptPassword(randomPassword);
            const newUser = queryRunner.manager.create(User, {
                name: `${trabajador.nombres} ${trabajador.apellidoPaterno} ${trabajador.apellidoMaterno}`,
                corporateEmail: correoUsuario,
                password: hashedPassword,
                role: "Usuario" as userRole,
                rut: trabajador.rut,
                estadoCuenta: "Activa",
                createAt: new Date(),
                updateAt: new Date()
            });
            await queryRunner.manager.save(User, newUser);

            // Enviar correo con credenciales
            let advertencias: string[] = [];
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

            // Crear ficha de empresa
            const fichaEmpresa = queryRunner.manager.create(FichaEmpresa, {
                cargo: "Por Definir",
                area: "Por Definir",
                tipoContrato: "Por Definir",
                jornadaLaboral: "Por Definir",
                sueldoBase: 0,
                trabajador: trabajadorGuardado,
                estado: EstadoLaboral.ACTIVO,
                fechaInicioContrato: undefined,
                fechaFinContrato: undefined
            });
            await queryRunner.manager.save(FichaEmpresa, fichaEmpresa);

            // Crear historial laboral inicial
            const historialRepo = queryRunner.manager.getRepository(HistorialLaboral);
            await historialRepo.save(historialRepo.create({
                trabajador: trabajadorGuardado,
                cargo: fichaEmpresa.cargo,
                area: fichaEmpresa.area,
                tipoContrato: fichaEmpresa.tipoContrato,
                jornadaLaboral: fichaEmpresa.jornadaLaboral,
                sueldoBase: fichaEmpresa.sueldoBase,
                fechaInicio: trabajadorGuardado.fechaIngreso,
                observaciones: `Registro inicial de trabajador. Cuenta de usuario: ${correoUsuario}, Rol: Usuario`,
                estado: fichaEmpresa.estado,
                registradoPor: registradoPorUser || newUser // Usar el usuario que registra, o el nuevo usuario si no se pasa
            }));

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

export async function getTrabajadoresService(incluirInactivos: boolean = false, filtros: any = {}): Promise<ServiceResponse<Trabajador[]>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        
        // Crear el query builder para usar búsquedas más flexibles
        const queryBuilder = trabajadorRepo.createQueryBuilder('trabajador')
            .leftJoinAndSelect('trabajador.usuario', 'usuario')
            .leftJoinAndSelect('trabajador.fichaEmpresa', 'fichaEmpresa')
            .leftJoinAndSelect('trabajador.historialLaboral', 'historialLaboral')
            .leftJoinAndSelect('trabajador.licenciasPermisos', 'licenciasPermisos');

        // Si no se incluyen inactivos, filtrar por enSistema=true
        if (!incluirInactivos && typeof filtros.enSistema === 'undefined') {
            queryBuilder.andWhere('trabajador.enSistema = :enSistema', { enSistema: true });
        }

        // Agregar filtros por campos si existen
        if (filtros.id) {
            queryBuilder.andWhere('trabajador.id = :id', { id: filtros.id });
        }
        if (filtros.rut) {
            queryBuilder.andWhere('trabajador.rut ILIKE :rut', { rut: `%${filtros.rut}%` });
        }
        if (filtros.nombres) {
            queryBuilder.andWhere('trabajador.nombres ILIKE :nombres', { nombres: `%${filtros.nombres}%` });
        }
        if (filtros.apellidoPaterno) {
            queryBuilder.andWhere('trabajador.apellidoPaterno ILIKE :apellidoPaterno', { apellidoPaterno: `%${filtros.apellidoPaterno}%` });
        }
        if (filtros.apellidoMaterno) {
            queryBuilder.andWhere('trabajador.apellidoMaterno ILIKE :apellidoMaterno', { apellidoMaterno: `%${filtros.apellidoMaterno}%` });
        }
        if (filtros.fechaNacimiento) {
            queryBuilder.andWhere('trabajador.fechaNacimiento = :fechaNacimiento', { fechaNacimiento: filtros.fechaNacimiento });
        }
        if (filtros.telefono) {
            queryBuilder.andWhere('trabajador.telefono ILIKE :telefono', { telefono: `%${filtros.telefono}%` });
        }
        if (filtros.correoPersonal) {
            queryBuilder.andWhere('trabajador.correoPersonal ILIKE :correoPersonal', { correoPersonal: `%${filtros.correoPersonal}%` });
        }
        if (filtros.numeroEmergencia) {
            queryBuilder.andWhere('trabajador.numeroEmergencia ILIKE :numeroEmergencia', { numeroEmergencia: `%${filtros.numeroEmergencia}%` });
        }
        if (filtros.direccion) {
            queryBuilder.andWhere('trabajador.direccion ILIKE :direccion', { direccion: `%${filtros.direccion}%` });
        }
        if (filtros.fechaIngreso) {
            queryBuilder.andWhere('trabajador.fechaIngreso = :fechaIngreso', { fechaIngreso: filtros.fechaIngreso });
        }
        if (typeof filtros.enSistema !== 'undefined') {
            queryBuilder.andWhere('trabajador.enSistema = :enSistema', { enSistema: filtros.enSistema === true || filtros.enSistema === 'true' });
        }

        // Ejecutar la consulta
        const trabajadores = await queryBuilder.getMany();
        return [trabajadores, null];
    } catch (error) {
        console.error("Error en getTrabajadoresService:", error);
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

        // Validación: No permitir desvinculación si está en licencia médica o permiso administrativo
        if (
            trabajador.fichaEmpresa &&
            (trabajador.fichaEmpresa.estado === EstadoLaboral.LICENCIA ||
             trabajador.fichaEmpresa.estado === EstadoLaboral.PERMISO)
        ) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, "No se puede desvincular a un trabajador mientras esté con licencia médica o permiso administrativo."];
        }

        // Validación: No permitir desvinculación si falta la fecha de inicio de contrato
        if (!trabajador.fichaEmpresa || !trabajador.fichaEmpresa.fechaInicioContrato) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, "Debes ingresar la fecha de inicio de contrato (en la ficha de empresa) antes de desvincular al trabajador."];
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

            // Crear snapshot en historial laboral con estado Desvinculado
            const historialRepo = queryRunner.manager.getRepository(HistorialLaboral);
            
            // Normalizar fechas para evitar problemas de zona horaria
            const fechaInicioNormalizada = trabajador.fichaEmpresa.fechaInicioContrato ? 
                new Date(trabajador.fichaEmpresa.fechaInicioContrato.toISOString().split('T')[0] + 'T12:00:00') : null;
            const fechaFinNormalizada = trabajador.fichaEmpresa.fechaFinContrato ? 
                new Date(trabajador.fichaEmpresa.fechaFinContrato.toISOString().split('T')[0] + 'T12:00:00') : null;
            const fechaInicioLicenciaPermisoNormalizada = trabajador.fichaEmpresa.fechaInicioLicenciaPermiso ? 
                new Date(trabajador.fichaEmpresa.fechaInicioLicenciaPermiso.toISOString().split('T')[0] + 'T12:00:00') : null;
            const fechaFinLicenciaPermisoNormalizada = trabajador.fichaEmpresa.fechaFinLicenciaPermiso ? 
                new Date(trabajador.fichaEmpresa.fechaFinLicenciaPermiso.toISOString().split('T')[0] + 'T12:00:00') : null;
            
            const nuevoHistorial = new HistorialLaboral();
            nuevoHistorial.trabajador = trabajador;
            nuevoHistorial.cargo = trabajador.fichaEmpresa.cargo;
            nuevoHistorial.area = trabajador.fichaEmpresa.area;
            nuevoHistorial.tipoContrato = trabajador.fichaEmpresa.tipoContrato;
            nuevoHistorial.jornadaLaboral = trabajador.fichaEmpresa.jornadaLaboral;
            nuevoHistorial.sueldoBase = trabajador.fichaEmpresa.sueldoBase;
            if (fechaInicioNormalizada) nuevoHistorial.fechaInicio = fechaInicioNormalizada;
            if (fechaFinNormalizada) nuevoHistorial.fechaFin = fechaFinNormalizada;
            nuevoHistorial.motivoDesvinculacion = trabajador.fichaEmpresa.motivoDesvinculacion;
            nuevoHistorial.observaciones = 'Desvinculación de trabajador';
            nuevoHistorial.contratoURL = trabajador.fichaEmpresa.contratoURL;
            nuevoHistorial.afp = trabajador.fichaEmpresa.afp;
            nuevoHistorial.previsionSalud = trabajador.fichaEmpresa.previsionSalud;
            nuevoHistorial.seguroCesantia = trabajador.fichaEmpresa.seguroCesantia;
            nuevoHistorial.estado = trabajador.fichaEmpresa.estado;
            if (fechaInicioLicenciaPermisoNormalizada) nuevoHistorial.fechaInicioLicenciaPermiso = fechaInicioLicenciaPermisoNormalizada;
            if (fechaFinLicenciaPermisoNormalizada) nuevoHistorial.fechaFinLicenciaPermiso = fechaFinLicenciaPermisoNormalizada;
            nuevoHistorial.motivoLicenciaPermiso = trabajador.fichaEmpresa.motivoLicenciaPermiso;
            nuevoHistorial.registradoPor = userId ? await queryRunner.manager.findOne(User, { where: { id: userId } }) : undefined;
            
            await historialRepo.save(nuevoHistorial);
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
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const trabajadorRepo = queryRunner.manager.getRepository(Trabajador);
        const userRepo = queryRunner.manager.getRepository(User);
        const historialRepo = queryRunner.manager.getRepository(HistorialLaboral);
        
        const trabajador = await trabajadorRepo.findOne({ 
            where: { id }, 
            relations: ["usuario", "fichaEmpresa"] 
        });

        if (!trabajador) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, "Trabajador no encontrado"];
        }
        if (!trabajador.usuario) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, "El trabajador no tiene usuario asociado"];
        }

        // LIMPIEZA AUTOMÁTICA: Eliminar espacios extra de todos los campos de texto
        data = limpiarCamposTexto(data);

        let updated = false;
        let correoUsuarioAnterior = trabajador.usuario.corporateEmail;
        let correoPersonalAnterior = trabajador.correoPersonal;
        let nuevoCorreoUsuario = trabajador.usuario.corporateEmail;

        // IGUAL QUE EN REACTIVAR: Generar correo ANTES de actualizar datos
        if (data.nombres || data.apellidoPaterno) {
            // Usar los datos actualizados correctamente para evitar reutilización de correos
            const nombresActualizados = data.nombres || trabajador.nombres;
            const apellidoPaternoActualizado = data.apellidoPaterno || trabajador.apellidoPaterno;
            
            const primerNombre = nombresActualizados.split(' ')[0].toLowerCase().normalize('NFD').replace(/[^a-zA-Z]/g, '');
            const apellidoPaterno = apellidoPaternoActualizado.toLowerCase().normalize('NFD').replace(/[^a-zA-Z]/g, '');
            
            // GENERAR CORREO ANTES DE CAMBIAR DATOS (igual que reactivarTrabajadorService)
            nuevoCorreoUsuario = await generateCorporateEmail(primerNombre, apellidoPaterno, queryRunner);
        }

        // DESPUÉS: Actualizar campos permitidos del trabajador
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

        // Si se actualiza el nombre o apellidos, actualizar el campo name en usuario
        if (data.nombres || data.apellidoPaterno || data.apellidoMaterno) {
            trabajador.usuario.name = `${data.nombres || trabajador.nombres} ${data.apellidoPaterno || trabajador.apellidoPaterno} ${data.apellidoMaterno || trabajador.apellidoMaterno}`;
            updated = true;
        }

        // Solo generar nueva contraseña si el correo corporativo cambió
        if (nuevoCorreoUsuario !== correoUsuarioAnterior) {
            // Generar nueva contraseña y encriptarla
            const nuevaPassword = generateRandomPassword();
            const hashedPassword = await encryptPassword(nuevaPassword);
            trabajador.usuario.password = hashedPassword;
            
            // Enviar correo con nuevas credenciales
            try {
                await sendCredentialsEmail({
                    to: trabajador.correoPersonal,
                    nombre: trabajador.nombres,
                    correoUsuario: nuevoCorreoUsuario,
                    passwordTemporal: nuevaPassword
                });
            } catch (emailError) {
                console.error("Error enviando correo de credenciales actualizadas:", emailError);
                // No fallar la operación por el correo, pero registrar el error
            }
        }
        
        // Actualizar el correo corporativo
        trabajador.usuario.corporateEmail = nuevoCorreoUsuario;
        updated = true;

        // Registrar cambios en historial laboral
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
        
        // IMPORTANTE: Registrar cambio de correo corporativo para el historial
        if (nuevoCorreoUsuario !== correoUsuarioAnterior) {
            cambios.push(`Cambio de correo corporativo: de "${correoUsuarioAnterior}" a "${nuevoCorreoUsuario}"`);
        }

        if (cambios.length > 0) {
            const nuevoHistorial = new HistorialLaboral();
            nuevoHistorial.trabajador = trabajador;
            nuevoHistorial.cargo = 'Actualización de datos personales';
            nuevoHistorial.area = 'N/A';
            nuevoHistorial.tipoContrato = 'N/A';
            nuevoHistorial.jornadaLaboral = 'N/A';
            nuevoHistorial.sueldoBase = 0;
            nuevoHistorial.fechaInicio = new Date();
            nuevoHistorial.observaciones = cambios.join(' | ');
            nuevoHistorial.estado = 'Activo';
            nuevoHistorial.registradoPor = data.registradoPor || undefined;
            
            await historialRepo.save(nuevoHistorial);
        }

        // Guardar cambios en trabajador y usuario
        if (updated) {
            await queryRunner.manager.save(Trabajador, trabajador);
            await queryRunner.manager.save(User, trabajador.usuario);
        }

        // Confirmar la transacción
        await queryRunner.commitTransaction();

        // Devolver el trabajador actualizado con relaciones
        const trabajadorFinal = await trabajadorRepo.findOne({ 
            where: { id }, 
            relations: ["usuario", "fichaEmpresa"] 
        });
        
        await queryRunner.release();
        return [trabajadorFinal, null];
    } catch (error) {
        console.error("Error en updateTrabajadorService:", error);
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        return [null, "Error interno del servidor"];
    }
}

// Servicio para reactivar trabajador desvinculado (revinculación)
export async function reactivarTrabajadorService(
    trabajadorId: number, 
    data: {
        nombres: string;
        apellidoPaterno: string;
        apellidoMaterno: string;
        correoPersonal: string;
        telefono?: string;
        numeroEmergencia?: string;
        direccion?: string;
        motivoReactivacion: string;
    },
    userId: number
): Promise<ServiceResponse<{ trabajador: Trabajador, nuevoCorreoCorporativo: string, credencialesEnviadas: boolean }>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const trabajadorRepo = queryRunner.manager.getRepository(Trabajador);
        const userRepo = queryRunner.manager.getRepository(User);
        const fichaRepo = queryRunner.manager.getRepository(FichaEmpresa);
        const historialRepo = queryRunner.manager.getRepository(HistorialLaboral);

        // 1. Validar que el ID existe y está desvinculado
        const trabajador = await trabajadorRepo.findOne({
            where: { id: trabajadorId },
            relations: ["usuario", "fichaEmpresa"]
        });

        if (!trabajador) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, "No se encontró un trabajador con ese ID"];
        }

        if (trabajador.enSistema) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, "Solo se pueden reactivar trabajadores desvinculados"];
        }

        if (!trabajador.usuario || !trabajador.fichaEmpresa) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, "Error: Trabajador sin usuario o ficha de empresa asociada"];
        }

        // 2. Obtener usuario que registra la reactivación
        const usuarioRegistra = await userRepo.findOne({ where: { id: userId } });
        if (!usuarioRegistra) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, "Usuario registrador no encontrado"];
        }

        // 3. Limpiar y validar datos
        const datosLimpios = {
            ...limpiarCamposTexto(data),
            motivoReactivacion: data.motivoReactivacion.trim()
        };
        
        if (!datosLimpios.nombres || !datosLimpios.apellidoPaterno || !datosLimpios.apellidoMaterno || !datosLimpios.correoPersonal) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, "Faltan campos requeridos: nombres, apellidos y correo personal"];
        }

        // Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(datosLimpios.correoPersonal)) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, "Formato de correo personal inválido"];
        }

        // 4. Generar nuevo correo corporativo (NUNCA reutilizar anteriores)
        const primerNombre = datosLimpios.nombres.split(' ')[0].toLowerCase().normalize('NFD').replace(/[^a-zA-Z]/g, '');
        const apellidoPaterno = datosLimpios.apellidoPaterno.toLowerCase().normalize('NFD').replace(/[^a-zA-Z]/g, '');
        const nuevoCorreoCorporativo = await generateCorporateEmail(primerNombre, apellidoPaterno, queryRunner);

        // 5. Generar nueva contraseña
        const nuevaPassword = generateRandomPassword();
        const hashedPassword = await encryptPassword(nuevaPassword);

        // 6. Actualizar datos del trabajador
        trabajador.nombres = datosLimpios.nombres;
        trabajador.apellidoPaterno = datosLimpios.apellidoPaterno;
        trabajador.apellidoMaterno = datosLimpios.apellidoMaterno;
        trabajador.correoPersonal = datosLimpios.correoPersonal;
        trabajador.telefono = datosLimpios.telefono || trabajador.telefono;
        trabajador.numeroEmergencia = datosLimpios.numeroEmergencia || trabajador.numeroEmergencia;
        trabajador.direccion = datosLimpios.direccion || trabajador.direccion;
        trabajador.fechaIngreso = new Date(); // Nueva fecha de ingreso
        trabajador.enSistema = true; // Reactivar

        // 7. Actualizar usuario
        trabajador.usuario.name = `${datosLimpios.nombres} ${datosLimpios.apellidoPaterno} ${datosLimpios.apellidoMaterno}`;
        trabajador.usuario.corporateEmail = nuevoCorreoCorporativo;
        trabajador.usuario.password = hashedPassword;
        trabajador.usuario.role = "Usuario"; // Siempre rol "Usuario" al reactivar
        trabajador.usuario.estadoCuenta = "Activa";
        trabajador.usuario.updateAt = new Date();

        // 8. Resetear ficha de empresa a estado activo con datos por defecto
        trabajador.fichaEmpresa.estado = EstadoLaboral.ACTIVO;
        trabajador.fichaEmpresa.cargo = "Por Definir";
        trabajador.fichaEmpresa.area = "Por Definir";
        trabajador.fichaEmpresa.tipoContrato = "Por Definir";
        trabajador.fichaEmpresa.jornadaLaboral = "Por Definir";
        trabajador.fichaEmpresa.sueldoBase = 0;
        trabajador.fichaEmpresa.fechaInicioContrato = new Date();
        trabajador.fichaEmpresa.fechaFinContrato = null;
        trabajador.fichaEmpresa.motivoDesvinculacion = null;
        trabajador.fichaEmpresa.fechaInicioLicenciaPermiso = null;
        trabajador.fichaEmpresa.fechaFinLicenciaPermiso = null;
        trabajador.fichaEmpresa.motivoLicenciaPermiso = null;

        // 9. Registrar reactivación en historial laboral
        const historialReactivacion = historialRepo.create({
            trabajador: trabajador,
            cargo: trabajador.fichaEmpresa.cargo,
            area: trabajador.fichaEmpresa.area,
            tipoContrato: trabajador.fichaEmpresa.tipoContrato,
            jornadaLaboral: trabajador.fichaEmpresa.jornadaLaboral,
            sueldoBase: trabajador.fichaEmpresa.sueldoBase,
            fechaInicio: new Date(),
            motivoReactivacion: datosLimpios.motivoReactivacion,
            observaciones: `Reactivación de trabajador. Nuevo correo corporativo: ${nuevoCorreoCorporativo}`,
            contratoURL: trabajador.fichaEmpresa.contratoURL,
            afp: trabajador.fichaEmpresa.afp,
            previsionSalud: trabajador.fichaEmpresa.previsionSalud,
            seguroCesantia: trabajador.fichaEmpresa.seguroCesantia,
            estado: trabajador.fichaEmpresa.estado,
            fechaInicioLicenciaPermiso: trabajador.fichaEmpresa.fechaInicioLicenciaPermiso,
            fechaFinLicenciaPermiso: trabajador.fichaEmpresa.fechaFinLicenciaPermiso,
            motivoLicenciaPermiso: trabajador.fichaEmpresa.motivoLicenciaPermiso,
            registradoPor: usuarioRegistra
        });

        // 10. Guardar todos los cambios
        await queryRunner.manager.save(Trabajador, trabajador);
        await queryRunner.manager.save(User, trabajador.usuario);
        await queryRunner.manager.save(FichaEmpresa, trabajador.fichaEmpresa);
        await queryRunner.manager.save(HistorialLaboral, historialReactivacion);

        // 11. Enviar credenciales por correo
        let credencialesEnviadas = false;
        try {
            await sendCredentialsEmail({
                to: trabajador.correoPersonal,
                nombre: trabajador.nombres,
                correoUsuario: nuevoCorreoCorporativo,
                passwordTemporal: nuevaPassword
            });
            credencialesEnviadas = true;
        } catch (emailError) {
            console.error("Error enviando correo de credenciales en reactivación:", emailError);
            // No fallar la operación por el correo, pero registrar el error
        }

        await queryRunner.commitTransaction();

        // Recargar el trabajador con sus relaciones
        const trabajadorReactivado = await trabajadorRepo.findOne({
            where: { id: trabajador.id },
            relations: ["usuario", "fichaEmpresa"]
        });

        return [{
            trabajador: trabajadorReactivado!,
            nuevoCorreoCorporativo,
            credencialesEnviadas
        }, null];

    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Error en reactivarTrabajadorService:", error);
        return [null, "Error interno del servidor"];
    } finally {
        await queryRunner.release();
    }
}