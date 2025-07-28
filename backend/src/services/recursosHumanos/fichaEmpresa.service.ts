import { AppDataSource } from "../../config/configDB.js";
import { FichaEmpresa, EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { ServiceResponse } from "../../../types.js";
import { FindOptionsWhere, ILike, LessThanOrEqual, MoreThanOrEqual, Between, In, DeepPartial } from "typeorm";
import { User } from "../../entity/user.entity.js";
import { LicenciaPermiso, TipoSolicitud, EstadoSolicitud } from "../../entity/recursosHumanos/licenciaPermiso.entity.js";
import { normalizeText } from "../../helpers/normalizeText.helper.js";
import { FileUploadService } from "../../services/fileUpload.service.js";
import path from 'path';
import { get } from "http";
import { Bono } from "../../entity/recursosHumanos/Remuneraciones/Bono.entity.js";
import { AsignarBono } from "../../entity/recursosHumanos/Remuneraciones/asignarBono.entity.js"; 
import { 
    AsignarBonoDTO,
    UpdateAsignarBonoDTO, 
} from "../../types/recursosHumanos/bono.dto.js";
import { HistorialLaboral } from "../../entity/recursosHumanos/historialLaboral.entity.js";

// Interfaz para los parámetros de búsqueda
interface SearchFichaParams {
    // Búsqueda por trabajador
    trabajadorId?: number;
    rut?: string;

    // Búsqueda por estado
    estado?: EstadoLaboral;
    estados?: EstadoLaboral[];

    // Búsqueda por información laboral
    cargo?: string;
    area?: string;
    tipoContrato?: string;
    jornadaLaboral?: string;
    afp?: string;
    previsionSalud?: string;
    seguroCesantia?: string;

    // Búsqueda por rango salarial
    sueldoBaseDesde?: number;
    sueldoBaseHasta?: number;

    // Búsqueda por fechas
    fechaInicioDesde?: Date;
    fechaInicioHasta?: Date;
    fechaFinDesde?: Date;
    fechaFinHasta?: Date;
    incluirSinFechaFin?: boolean;

    // Búsqueda por id de ficha
    id?: number;

    //Búsqueda por bonos
    bonoId?: number;
    bonoNombre?: string;
    bonoActivo?: boolean;
}

export function calcularFechaFin(temporalidad: string, fechaInicio: Date, duracionMes?: number): Date | null {
    let fechaFin: Date | null = null;
    switch (temporalidad) {
        case 'permanente':
            // No tiene fecha fin
            fechaFin = null;
            break;
        case 'puntual':
            // Dura 1 mes desde la fecha de inicio como default
            fechaFin = new Date(fechaInicio);
            if (duracionMes && duracionMes > 0) {
                fechaFin.setMonth(fechaFin.getMonth() + duracionMes);
            } else {
                fechaFin.setMonth(fechaFin.getMonth() + 1);
            }
            break;
        case 'recurrente':
            if (duracionMes && duracionMes > 0) {
                fechaFin = new Date(fechaInicio);
                fechaFin.setMonth(fechaFin.getMonth() + duracionMes);
            } else {
                fechaFin = null;
            }
            break;
        default:
            console.error('Tipo de temporalidad desconocido:', temporalidad);
    }
    return fechaFin;
}

// Esta función se podría usar al calcular asignación, actualizar asignación, obtener datos de fichas, obtener datos de asignaciones, calcular remuneraciones
function verificarCambiosBonos ( asignarBono: AsignarBono, newBono: Bono ): [AsignarBono, string] | [null , string] {
    let errorMessage: string | null = null; 
    let messageSuport: string | null = null;
    // Verificar que la asignacion este activa, solo las activas se pueden editar, las inactivas no serán visibles en getMiFicha, getFichasEmpresa
    if (asignarBono.activo === false) {
        // Mensaje de que la asignacion esta inactiva, o la asignación se ha acabado en caso que simplemente se esté obteniendo en un get
        // En caso de getMiFicha o getFichasEmpresa, no se mostrará la asignación inactiva
        // En caso de updateAsignarBono, se mostrará un mensaje de error
        errorMessage = "Asignacion de bono inactiva";
        return [null, errorMessage];
    }
    const hoy = new Date();
    const fechaHoyString = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    let fechaFin: Date | null = null;

    // Verificar si hay un cambio en bono que afecte la asignación, actualizar asignacion, obtener asignaciones, obtener fichas y asignaciones, calcular remuneraciones
    // Verificar cambio de bono
    if (asignarBono.bono !== newBono) {
        // Lógica para manejar el cambio de id
        asignarBono.bono = newBono;
        // Actualizar fecha de asignación
        asignarBono.fechaAsignacion = new Date(fechaHoyString);
        fechaFin = calcularFechaFin(newBono.temporalidad, asignarBono.fechaAsignacion, newBono.duracionMes);
        asignarBono.fechaFinAsignacion = fechaFin;
        messageSuport = "Cambio calculo de remumeraciones, cambio calculo de asignacion activa";
        return [asignarBono, messageSuport];
    }

    // Verificar cambio de temporalidad, en caso de que pase esto se recalcula la fecha de fin, si este cambio fue en conjunto con una duracion mes, los calculos cambian
    if (asignarBono.bono.temporalidad !== newBono.temporalidad) {
        if (asignarBono.bono.duracionMes !== newBono.duracionMes) {
            fechaFin = calcularFechaFin(newBono.temporalidad, asignarBono.fechaAsignacion, newBono.duracionMes);
            asignarBono.fechaFinAsignacion = fechaFin;
            asignarBono.bono.temporalidad = newBono.temporalidad;
            asignarBono.bono.duracionMes = newBono.duracionMes;
            messageSuport = "Cambio calculo de remumeraciones, cambio calculo de asignacion activa";
            return [asignarBono, messageSuport];
        } else {
            // Solo importa el cambio de temporalidad
            fechaFin = calcularFechaFin(newBono.temporalidad, asignarBono.fechaAsignacion, asignarBono.bono.duracionMes);
            asignarBono.fechaFinAsignacion = fechaFin;
            asignarBono.bono.temporalidad = newBono.temporalidad;
            messageSuport = "Cambio calculo de remumeraciones, cambio calculo de asignacion activa";
            return [asignarBono, messageSuport];
        }
    }
    // Verificar cambio de duracionMes
    if (asignarBono.bono.duracionMes !== newBono.duracionMes) {
        fechaFin = calcularFechaFin(asignarBono.bono.temporalidad, asignarBono.fechaAsignacion, newBono.duracionMes);
        asignarBono.fechaFinAsignacion = fechaFin;
        asignarBono.bono.duracionMes = newBono.duracionMes;
        messageSuport = "Cambio calculo de remumeraciones, cambio calculo de asignacion activa";
        return [asignarBono, messageSuport];
    }
    // Verificar si hubo un cambio de imponibilidad
    if (asignarBono.bono.imponible !== newBono.imponible) {
        messageSuport = "Cambio calculo de remumeraciones";
        return [null, messageSuport];
    }
    // Verificar si hubo un cambio de monto
    if (asignarBono.bono.monto !== newBono.monto) {
        messageSuport = "Cambio calculo de remumeraciones";
        return [null, messageSuport];
    }
    // Si no hubo cambios relevantes, retornar null
    return [null, "SIN CAMBIOS"];
}

export async function getFichasEmpresaService(params: SearchFichaParams): Promise<ServiceResponse<FichaEmpresa[]>> {
    try {
        const fichaRepo = AppDataSource.getRepository(FichaEmpresa);
        const queryBuilder = fichaRepo.createQueryBuilder("ficha")
            .leftJoinAndSelect("ficha.trabajador", "trabajador")
            .leftJoinAndSelect("trabajador.usuario", "usuario")
            .leftJoinAndSelect("ficha.asignacionesBonos", "asignacionesBonos")
            .leftJoinAndSelect("asignacionesBonos.bono", "bono");
        
        // Filtros por trabajador
        if (params.rut) {
            // Limpiar el RUT de búsqueda (quitar puntos y guión)
            const cleanRut = params.rut.replace(/\./g, '').replace(/-/g, '');
            
            // Buscar tanto el RUT limpio como el RUT con formato
            queryBuilder.andWhere(
                "REPLACE(REPLACE(trabajador.rut, '.', ''), '-', '') ILIKE :cleanRut",
                { cleanRut: `%${cleanRut}%` }
            );
        }

        if (params.trabajadorId) {
            queryBuilder.andWhere("trabajador.id = :trabajadorId", { trabajadorId: params.trabajadorId });
        }

        // Filtro por id de ficha
        if (params.id) {
            queryBuilder.andWhere("ficha.id = :id", { id: params.id });
        }

        // Filtro por estado
        if (params.estado) {
            queryBuilder.andWhere("ficha.estado = :estado", { estado: params.estado });
        } else if (params.estados && params.estados.length > 0) {
            queryBuilder.andWhere("ficha.estado IN (:...estados)", { estados: params.estados });
        }

        // Filtros por información laboral (búsqueda parcial)
        if (params.cargo) {
            const cargoTrimmed = params.cargo.trim().toLowerCase();
            // Manejar el caso especial de "sin cargo"/"sin cárgo"
            if (cargoTrimmed === 'sin cargo' || cargoTrimmed === 'sin cárgo') {
                queryBuilder.andWhere("LOWER(ficha.cargo) SIMILAR TO :cargoPattern", {
                    cargoPattern: '%(sin cargo|sin cárgo)%'
                });
            } else {
                queryBuilder.andWhere("LOWER(ficha.cargo) ILIKE LOWER(:cargo)", { cargo: `%${cargoTrimmed}%` });
            }
        }
        if (params.area) {
            const areaTrimmed = params.area.trim().toLowerCase();
            // Manejar el caso especial de "sin area"/"sin área"
            if (areaTrimmed === 'sin area' || areaTrimmed === 'sin área') {
                queryBuilder.andWhere("LOWER(ficha.area) SIMILAR TO :areaPattern", { 
                    areaPattern: '%(sin area|sin área)%' 
                });
            } else {
                queryBuilder.andWhere("LOWER(ficha.area) ILIKE LOWER(:area)", { area: `%${areaTrimmed}%` });
            }
        }
        if (params.tipoContrato) {
            queryBuilder.andWhere("ficha.tipoContrato = :tipoContrato", { tipoContrato: params.tipoContrato });
        }
        if (params.jornadaLaboral) {
            queryBuilder.andWhere("ficha.jornadaLaboral = :jornadaLaboral", { jornadaLaboral: params.jornadaLaboral });
        }

        // Filtro por rango salarial
        if (params.sueldoBaseDesde || params.sueldoBaseHasta) {
            if (params.sueldoBaseDesde) {
                queryBuilder.andWhere("ficha.sueldoBase >= :sueldoBaseDesde", { sueldoBaseDesde: params.sueldoBaseDesde });
            }
            if (params.sueldoBaseHasta) {
                queryBuilder.andWhere("ficha.sueldoBase <= :sueldoBaseHasta", { sueldoBaseHasta: params.sueldoBaseHasta });
            }
        }

        // Filtros por previsión de salud y AFP
        if (params.previsionSalud) {
            queryBuilder.andWhere("ficha.previsionSalud = :previsionSalud", { previsionSalud: params.previsionSalud });
        }
        if (params.afp) {
            queryBuilder.andWhere("ficha.afp = :afp", { afp: params.afp });
        }

        // Filtro por seguro de cesantía
        if (params.seguroCesantia !== undefined) {
            queryBuilder.andWhere("ficha.seguroCesantia = :seguroCesantia", { seguroCesantia: params.seguroCesantia });
        }

        // Filtros por fechas
        if (params.fechaInicioDesde || params.fechaInicioHasta) {
            if (params.fechaInicioDesde) {
                queryBuilder.andWhere("ficha.fechaInicioContrato >= :fechaInicioDesde", 
                    { fechaInicioDesde: params.fechaInicioDesde });
            }
            if (params.fechaInicioHasta) {
                queryBuilder.andWhere("ficha.fechaInicioContrato <= :fechaInicioHasta", 
                    { fechaInicioHasta: params.fechaInicioHasta });
            }
        }

        if (params.fechaFinDesde || params.fechaFinHasta) {
            if (params.incluirSinFechaFin) {
                // Si se incluyen fichas sin fecha fin, usar OR para incluir NULL
                const fechaFinConditions = [];
                const fechaFinParams: any = {};
                
                if (params.fechaFinDesde) {
                    fechaFinConditions.push("ficha.fechaFinContrato >= :fechaFinDesde");
                    fechaFinParams.fechaFinDesde = params.fechaFinDesde;
                }
                if (params.fechaFinHasta) {
                    fechaFinConditions.push("ficha.fechaFinContrato <= :fechaFinHasta");
                    fechaFinParams.fechaFinHasta = params.fechaFinHasta;
                }
                
                if (fechaFinConditions.length > 0) {
                    const condition = `(${fechaFinConditions.join(' AND ')} OR ficha.fechaFinContrato IS NULL)`;
                    queryBuilder.andWhere(condition, fechaFinParams);
                }
            } else {
                // Comportamiento original: solo fichas con fecha fin
                if (params.fechaFinDesde) {
                    queryBuilder.andWhere("ficha.fechaFinContrato >= :fechaFinDesde", 
                        { fechaFinDesde: params.fechaFinDesde });
                }
                if (params.fechaFinHasta) {
                    queryBuilder.andWhere("ficha.fechaFinContrato <= :fechaFinHasta", 
                        { fechaFinHasta: params.fechaFinHasta });
                }
            }
        }



        // Ordenar por ID
        queryBuilder.orderBy("ficha.id", "ASC");

        const fichas = await queryBuilder.getMany();

        // Devolver array vacío en lugar de error cuando no hay fichas
        return [fichas, null];
    } catch (error) {
        console.error("Error al buscar fichas de empresa:", error);
        return [null, { message: "Error interno del servidor" }];
    }
}

export async function getMiFichaService(userId: number): Promise<ServiceResponse<FichaEmpresa>> {
    try {
        const userRepo = AppDataSource.getRepository(User);
        const fichaRepo = AppDataSource.getRepository(FichaEmpresa);

        const user = await userRepo.findOne({
            where: { id: userId },
            relations: ["trabajador"]
        });

        if (!user || !user.trabajador) {
            return [null, { message: "Usuario no encontrado o no tiene ficha asociada" }];
        }

        const ficha = await fichaRepo.findOne({
            where: { trabajador: { id: user.trabajador.id } },
            relations: ["trabajador", "trabajador.usuario", "asignacionesBonos", "asignacionesBonos.bono"]
        });

        if (!ficha) {
            return [null, { message: "Ficha no encontrada" }];
        }

        // Debug: Verificar si las asignaciones de bonos se cargaron correctamente
        console.log('Ficha encontrada:', {
            id: ficha.id,
            trabajador: ficha.trabajador?.nombres,
            asignacionesBonos: ficha.asignacionesBonos?.length || 0,
            bonosActivos: ficha.asignacionesBonos?.filter(ab => ab.activo).length || 0
        });

        return [ficha, null];
    } catch (error) {
        console.error("Error en getMiFichaService:", error);
        return [null, { message: "Error interno del servidor" }];
    }
}

// Definir los campos que no se pueden modificar según el estado
const CAMPOS_PROTEGIDOS = ['id', 'trabajador', 'asignacionesBonos'] as const;
const CAMPOS_ESTADO_DESVINCULADO = ['cargo', 'area', 'tipoContrato', 'jornadaLaboral', 'sueldoBase', 'afp', 'previsionSalud', 'seguroCesantia'] as const;

export async function updateFichaEmpresaService(
    id: number, 
    fichaData: Partial<FichaEmpresa>,
    usuarioAutenticado?: User,
    file?: Express.Multer.File
): Promise<ServiceResponse<FichaEmpresa>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const fichaRepo = queryRunner.manager.getRepository(FichaEmpresa);
        
        // 1. Obtener la ficha actual con sus relaciones
        const fichaActual = await fichaRepo.findOne({
            where: { id },
            relations: ["trabajador", "trabajador.usuario", "asignacionesBonos", "asignacionesBonos.bono"]
        });

        if (!fichaActual) {
            return [null, { message: "Ficha no encontrada" }];
        }// 2. Validar campos protegidos
        const camposInvalidos = CAMPOS_PROTEGIDOS.filter(campo => campo in fichaData);
        if (camposInvalidos.length > 0) {
            return [null, { message: `No se pueden modificar los siguientes campos: ${camposInvalidos.join(', ')}` }];
        }

        // 3. Validar según el estado actual
        if (fichaActual.estado === EstadoLaboral.DESVINCULADO) {
            const intentaModificar = CAMPOS_ESTADO_DESVINCULADO.filter(campo => campo in fichaData);
            if (intentaModificar.length > 0) {
                return [null, { message: "No se pueden modificar datos laborales de una ficha desvinculada" }];
            }
        }

        // === INICIO: Validación de primer update y coherencia de fecha fin ===
        // Detectar si es el primer update (campos clave vacíos o por defecto)
        const esPrimerUpdate = !fichaActual.cargo && !fichaActual.area && !fichaActual.tipoContrato && !fichaActual.jornadaLaboral && (!fichaActual.sueldoBase || fichaActual.sueldoBase === 0);
        if (esPrimerUpdate) {
            const camposObligatorios = [
                { key: 'cargo', label: 'Cargo' },
                { key: 'area', label: 'Área' },
                { key: 'tipoContrato', label: 'Tipo de contrato' },
                { key: 'jornadaLaboral', label: 'Jornada laboral' },
                { key: 'sueldoBase', label: 'Sueldo base' },
                { key: 'fechaInicioContrato', label: 'Fecha de inicio de contrato' }
            ];
            const faltantes = camposObligatorios.filter(campo => {
                const nuevoValor = (fichaData as any)[campo.key];
                return nuevoValor === undefined || nuevoValor === null || nuevoValor === '' || (campo.key === 'sueldoBase' && (!nuevoValor || nuevoValor === 0));
            });
            if (faltantes.length > 0) {
                return [null, { message: `En el primer update debe completar los siguientes campos obligatorios: ${faltantes.map(f => f.label).join(', ')}` }];
            }
        }

        // Validar coherencia de fecha fin según tipo de contrato
        const tipoContratoNuevo = fichaData.tipoContrato || fichaActual.tipoContrato;
        const fechaFinNueva = fichaData.fechaFinContrato !== undefined ? fichaData.fechaFinContrato : fichaActual.fechaFinContrato;
        if (tipoContratoNuevo === 'Indefinido') {
            // No debe permitirse fecha fin
            if (fechaFinNueva) {
                return [null, { message: "No se debe ingresar fecha de fin para contratos indefinidos" }];
            }
        } else {
            // Para otros tipos, la fecha fin es obligatoria y debe ser posterior a la de inicio
            const fechaInicio = fichaData.fechaInicioContrato || fichaActual.fechaInicioContrato;
            if (!fechaFinNueva) {
                return [null, { message: "Debe ingresar fecha de fin para contratos que no son indefinidos" }];
            }
            if (fechaInicio && fechaFinNueva) {
                const fechaFinDate = new Date(fechaFinNueva);
                const fechaInicioDate = new Date(fechaInicio);
                if (fechaFinDate <= fechaInicioDate) {
                    return [null, { message: "La fecha de fin de contrato debe ser al menos un día posterior a la fecha de inicio" }];
                }
            }
        }
        // === FIN: Validación de primer update y coherencia de fecha fin ===

        // 4. Validar cambios específicos
        if ('sueldoBase' in fichaData && fichaData.sueldoBase !== undefined) {
            if (fichaData.sueldoBase <= 0) {
                return [null, { message: "El sueldo base debe ser mayor a 0" }];
            }
        }

        if ('afp' in fichaData && fichaData.afp) {
            const afpsValidas = ["habitat", "provida", "modelo", "cuprum", "capital", "planvital", "uno"];
            if (!afpsValidas.includes(fichaData.afp)) {
                return [null, { message: "AFP no válida" }];
            }
        }

        if ('previsionSalud' in fichaData && fichaData.previsionSalud) {
            const previsionesValidas = ["ISAPRE", "FONASA"];
            if (!previsionesValidas.includes(fichaData.previsionSalud)) {
                return [null, { message: "Previsión de salud no válida" }];
            }
        }

        if ('seguroCesantia' in fichaData && fichaData.seguroCesantia !== undefined) {
            const valoresValidos = ["Sí", "No"];
            if (!valoresValidos.includes(fichaData.seguroCesantia)) {
                return [null, { message: "El seguro de cesantía debe ser 'Sí' o 'No'" }];
            }
        }

        if ('fechaFinContrato' in fichaData && fichaData.fechaFinContrato) {
            const fechaFin = new Date(fichaData.fechaFinContrato);
            // Solo comparar si ya existe una fecha de inicio previa
            if (fichaActual.fechaInicioContrato) {
                if (fechaFin <= fichaActual.fechaInicioContrato) {
                    return [null, { message: "La fecha de fin de contrato debe ser al menos un día posterior a la fecha de inicio" }];
                }
            }
            // Si no existe fecha de inicio previa, permitir el ingreso sin comparar
        }

        if ('tipoContrato' in fichaData && fichaData.tipoContrato) {
            const tiposValidos = ["Indefinido", "Plazo Fijo", "Por Obra", "Part-Time"];
            if (!tiposValidos.includes(fichaData.tipoContrato)) {
                return [null, { message: "Tipo de contrato no válido" }];
            }
        }

        if ('jornadaLaboral' in fichaData && fichaData.jornadaLaboral) {
            const jornadasValidas = ["Completa", "Media", "Part-Time"];
            if (!jornadasValidas.includes(fichaData.jornadaLaboral)) {
                return [null, { message: "Jornada laboral no válida" }];
            }
        }

        
        // 6. Aplicar los cambios validados
        let huboActualizacionCampos = false;
        const camposModificados: string[] = [];

        // Detectar cambios en campos relevantes
        const camposRelevantes = [
            'cargo', 'area', 'tipoContrato', 'jornadaLaboral', 'sueldoBase',
            'afp', 'previsionSalud', 'seguroCesantia', 'fechaInicioContrato', 'fechaFinContrato'
        ];
        // Función robusta para comparar valores
        function sonDiferentes(nuevo: any, original: any, campo: string): boolean {
            // Comparar fechas solo por YYYY-MM-DD
            if (campo.toLowerCase().includes('fecha')) {
                if (!nuevo && !original) return false;
                const fechaN = nuevo ? new Date(nuevo).toISOString().split('T')[0] : '';
                const fechaO = original ? new Date(original).toISOString().split('T')[0] : '';
                return fechaN !== fechaO;
            }
            // Comparar números
            if (typeof original === 'number' || typeof nuevo === 'number') {
                return Number(nuevo) !== Number(original);
            }
            // Comparar booleanos
            if (typeof original === 'boolean' || typeof nuevo === 'boolean') {
                return Boolean(nuevo) !== Boolean(original);
            }
            // Comparar strings (trim y lower)
            if (typeof nuevo === 'string' && typeof original === 'string') {
                return nuevo.trim().toLowerCase() !== original.trim().toLowerCase();
            }
            // Comparar nulos/vacíos
            if ((!nuevo && original) || (nuevo && !original)) {
                return true;
            }
            // Fallback
            return String(nuevo) !== String(original);
        }

        // Guardar valores originales antes de aplicar cambios
        const valoresOriginales: Record<string, any> = {};
        for (const campo of camposRelevantes) {
            valoresOriginales[campo] = (fichaActual as any)[campo];
        }
        const contratoOriginal = fichaActual.contratoURL;

        // Detectar cambios en campos relevantes (comparando original vs NUEVO del request)
        let huboSubidaContrato = false;
        let huboCambios = false;
        const camposRealmenteModificados: string[] = [];
        for (const campo of camposRelevantes) {
            if (campo in fichaData && (fichaData as any)[campo] !== undefined) {
                const valorNuevo = (fichaData as any)[campo];
                const valorOriginal = valoresOriginales[campo];
                if (sonDiferentes(valorNuevo, valorOriginal, campo)) {
                    camposRealmenteModificados.push(campo);
                    huboCambios = true;
                }
            }
        }

        // Manejar subida de contrato (si hay archivo)
        let contratoAnterior = contratoOriginal;
        let nuevoContratoFilename = contratoAnterior;
        if (file) {
            nuevoContratoFilename = file.filename;
            // NO eliminar el archivo anterior para mantener trazabilidad histórica
            // if (contratoAnterior) {
            //     const oldFilePath = FileUploadService.getContratoPath(contratoAnterior);
            //     FileUploadService.deleteFile(oldFilePath);
            // }
            // Solo marcar como cambio si el contrato es diferente
            if (!contratoAnterior || contratoAnterior !== nuevoContratoFilename) {
                huboSubidaContrato = true;
                huboCambios = true;
            }
        }

        // Si no hubo cambios, NO guardar ni crear historial
        if (!huboCambios) {
            await queryRunner.release();
            return [fichaActual, null];
        }

        // Aplicar solo los cambios realmente modificados
        for (const campo of camposRealmenteModificados) {
            (fichaActual as any)[campo] = (fichaData as any)[campo];
        }
        if (huboSubidaContrato) {
            fichaActual.contratoURL = nuevoContratoFilename;
        }

        // Guardar los cambios
        const fichaActualizada = await fichaRepo.save(fichaActual);

        // Determinar observaciones
        let observaciones = '';
        if (camposRealmenteModificados.length > 0) {
            // Listar los cambios con valores anteriores y nuevos
            const cambios = camposRealmenteModificados.map(campo => {
                const valorAnterior = valoresOriginales[campo];
                const valorNuevo = (fichaData as any)[campo];
                
                // Formatear fechas
                if (campo.toLowerCase().includes('fecha')) {
                    const va = valorAnterior ? new Date(valorAnterior).toISOString().split('T')[0] : '';
                    const vn = valorNuevo ? new Date(valorNuevo).toISOString().split('T')[0] : '';
                    return `${campo} (de '${va}' a '${vn}')`;
                }
                
                // Formatear sueldo base con símbolo de peso y separadores de miles
                if (campo === 'sueldoBase') {
                    const va = valorAnterior ? `$${valorAnterior.toLocaleString('es-CL')}` : '$0';
                    const vn = valorNuevo ? `$${valorNuevo.toLocaleString('es-CL')}` : '$0';
                    return `${campo} (de '${va}' a '${vn}')`;
                }
                
                return `${campo} (de '${valorAnterior ?? ''}' a '${valorNuevo ?? ''}')`;
            });
            observaciones = `Actualización de información laboral: ${cambios.join(', ')}`;
            if (huboSubidaContrato) {
                observaciones += ' + subida de contrato PDF';
            }
        } else if (huboSubidaContrato) {
            observaciones = 'Subida de contrato PDF';
        } else {
            observaciones = 'Sin cambios relevantes';
        }

        // Crear snapshot en historial laboral SOLO si hubo algún cambio relevante
        if (camposRealmenteModificados.length > 0 || huboSubidaContrato) {
            const historialRepo = queryRunner.manager.getRepository('HistorialLaboral');
            // Normalizar fechas para evitar problemas de zona horaria
            const fechaInicioNormalizada = fichaActualizada.fechaInicioContrato ? 
                new Date(fichaActualizada.fechaInicioContrato.toISOString().split('T')[0] + 'T12:00:00') : null;
            const fechaFinNormalizada = fichaActualizada.fechaFinContrato ? 
                new Date(fichaActualizada.fechaFinContrato.toISOString().split('T')[0] + 'T12:00:00') : null;
            const fechaInicioLicenciaPermisoNormalizada = fichaActualizada.fechaInicioLicenciaPermiso ? 
                new Date(fichaActualizada.fechaInicioLicenciaPermiso.toISOString().split('T')[0] + 'T12:00:00') : null;
            const fechaFinLicenciaPermisoNormalizada = fichaActualizada.fechaFinLicenciaPermiso ? 
                new Date(fichaActualizada.fechaFinLicenciaPermiso.toISOString().split('T')[0] + 'T12:00:00') : null;
            await historialRepo.save(historialRepo.create({
                trabajador: fichaActualizada.trabajador,
                cargo: fichaActualizada.cargo,
                area: fichaActualizada.area,
                tipoContrato: fichaActualizada.tipoContrato,
                jornadaLaboral: fichaActualizada.jornadaLaboral,
                sueldoBase: fichaActualizada.sueldoBase,
                fechaInicio: fechaInicioNormalizada,
                fechaFin: fechaFinNormalizada,
                motivoDesvinculacion: fichaActualizada.motivoDesvinculacion,
                observaciones,
                contratoURL: fichaActualizada.contratoURL,
                afp: fichaActualizada.afp,
                previsionSalud: fichaActualizada.previsionSalud,
                seguroCesantia: fichaActualizada.seguroCesantia,
                estado: fichaActualizada.estado,
                fechaInicioLicenciaPermiso: fechaInicioLicenciaPermisoNormalizada,
                fechaFinLicenciaPermiso: fechaFinLicenciaPermisoNormalizada,
                motivoLicenciaPermiso: fichaActualizada.motivoLicenciaPermiso,
                registradoPor: usuarioAutenticado || fichaActualizada.trabajador?.usuario || null
            }));
        }

        await queryRunner.commitTransaction();
        return [fichaActualizada, null];
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Error en updateFichaEmpresaService:", error);
        return [null, { message: "Error interno del servidor" }];
    } finally {
        await queryRunner.release();
    }
}

export async function descargarContratoService( id: number, userId: number ): Promise<ServiceResponse<{filePath: string, customFilename: string}>> {
    try {
        const fichaRepo = AppDataSource.getRepository(FichaEmpresa);
        const userRepo = AppDataSource.getRepository(User);

        const ficha = await fichaRepo.findOne({
            where: { id },
            relations: ["trabajador"]
        });

        if (!ficha) {
            return [null, { message: "Ficha no encontrada" }];
        }const user = await userRepo.findOne({
            where: { id: userId },
            relations: ["trabajador"]
        });

        if (!user) {
            return [null, { message: "Usuario no encontrado" }];
        }

        // Permitir acceso a RRHH, Admin, Superadmin o al dueño de la ficha
        const esRRHH = user.role === "RecursosHumanos";
        const esAdmin = user.role === "Administrador";
        const esSuperAdmin = user.role === "SuperAdministrador";
        const esDueno = user.trabajador?.id === ficha.trabajador.id;

        const tienePrivilegios = esRRHH || esAdmin || esSuperAdmin || esDueno;

        if (!tienePrivilegios) {
            return [null, { message: "No tiene permiso para descargar este contrato" }];
        }

        if (!ficha.contratoURL) {
            return [null, { message: "No hay contrato disponible para descargar" }];
        }

        // Usar el servicio de archivos para obtener la ruta absoluta y correcta
        const filePath = FileUploadService.getContratoPath(ficha.contratoURL);

        // Verificar si el archivo existe
        if (!FileUploadService.fileExists(filePath)) {
            return [null, { message: "El archivo del contrato no se encuentra en el servidor." }];
        }

        // Generar nombre personalizado
        const trabajador = ficha.trabajador;

        // Función para limpiar caracteres especiales y espacios
        const limpiarNombre = (nombre: string): string => {
            return nombre
                .replace(/[áàäâ]/g, 'a')
                .replace(/[éèëê]/g, 'e')
                .replace(/[íìïî]/g, 'i')
                .replace(/[óòöô]/g, 'o')
                .replace(/[úùüû]/g, 'u')
                .replace(/[ñ]/g, 'n')
                .replace(/[ç]/g, 'c')
                .replace(/[^a-zA-Z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
        };

        const nombresLimpios = limpiarNombre(trabajador.nombres || '');
        const apellidoPLimpio = limpiarNombre(trabajador.apellidoPaterno || '');
        const apellidoMLimpio = limpiarNombre(trabajador.apellidoMaterno || '');

        // Construir nombre personalizado
        let customFilename = '';
        if (nombresLimpios && apellidoPLimpio) {
            customFilename = `${nombresLimpios}_${apellidoPLimpio}`;
            if (apellidoMLimpio) {
                customFilename += `_${apellidoMLimpio}`;
            }
            customFilename += '-Contrato.pdf';
        }

        // Validar que el nombre personalizado sea válido
        if (!customFilename || customFilename.length < 5 || !customFilename.includes('-Contrato.pdf')) {
            customFilename = `Contrato_${id}.pdf`;
        }

        return [{ filePath, customFilename }, null];
    } catch (error) {
        console.error("Error en descargarContratoService:", error);
        return [null, { message: "Error interno del servidor" }];
    }
} 

export async function deleteContratoService( id: number ): Promise<ServiceResponse<{ deleted: boolean }>> {
    try {
        const fichaRepository = AppDataSource.getRepository(FichaEmpresa);
        const ficha = await fichaRepository.findOne({ where: { id }, relations: ['trabajador'] });
        if (!ficha) {
            return [null, { message: "Ficha no encontrada" }];
        }
        if (!ficha.contratoURL) {
            return [null, { message: "No hay contrato para eliminar" }];
        }
        // NO eliminar archivo físico para mantener trazabilidad histórica
        // const deleted = FileUploadService.deleteContratoFile(ficha.contratoURL);
        // Actualizar ficha
        ficha.contratoURL = null;
        await fichaRepository.save(ficha);
        return [{ deleted: true }, null];
    } catch (error) {
        console.error("Error en deleteContratoService:", error);
        return [null, { message: "Error interno del servidor" }];
    }
}

// Asignar Bono
export async function assignBonoService (idFicha: number, data: AsignarBonoDTO, usuarioAutenticado?: User): Promise<ServiceResponse<AsignarBono>> {
    // Crear un query runner para manejar transacciones
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const fichaRepo = queryRunner.manager.getRepository(FichaEmpresa);
        const bonoRepo = queryRunner.manager.getRepository(Bono);
        const asignarBonoRepo = queryRunner.manager.getRepository(AsignarBono);
        const historialRepo = queryRunner.manager.getRepository(HistorialLaboral);
        // Obtener los repositorios necesarios
        const fichaActual = await fichaRepo.findOne({
            where: { id: idFicha },
            relations: ["trabajador", "trabajador.usuario", "asignacionesBonos", "asignacionesBonos.bono"]
        });
        
        // Validar si el bono existe
        const bono = await bonoRepo.findOneBy({ id: data.bonoId });
        if (!bono) {
            await queryRunner.rollbackTransaction();
            return [null, "Bono no encontrado"];
        }

        // Validar si el bono ya está asignado al trabajador
        if (!fichaActual) {
            await queryRunner.rollbackTransaction();
            return [null, "Ficha no encontrada"];
        }
        const asignacionExistente = Array.isArray(fichaActual.asignacionesBonos)
        ? fichaActual.asignacionesBonos.filter(ab => ab.bono.id === bono.id)
        : [];

        if (asignacionExistente.length > 0) {
            await queryRunner.rollbackTransaction();
            return [null, "El bono ya está asignado a esta ficha"];
        }

        // Validar fechas - usar comparación de strings y crear fechas locales correctamente
        const hoy = new Date();
        const fechaHoyString = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    
        
    
        // Crear fechas locales correctamente manejando tanto strings como objetos Date
        let fechaInicio: Date;
        let fechaFin: Date | null = null;
        
        fechaInicio = fechaHoyString ? new Date(fechaHoyString) : new Date();

       // Determinar fechaFin según la temporalidad
        switch (bono.temporalidad) {
            case 'permanente':
                // No tiene fecha fin
                fechaFin = null;
                break;

            case 'puntual':
                // Dura 1 mes desde la fecha de inicio como default
                fechaFin = new Date(fechaInicio);
                if (bono.duracionMes && bono.duracionMes > 0) {
                    fechaFin.setMonth(fechaFin.getMonth() + bono.duracionMes);
                } else {
                    fechaFin.setMonth(fechaFin.getMonth() + 1);
                }
                break;

            case 'recurrente':
                if (bono.duracionMes && bono.duracionMes > 0) {
                    fechaFin = new Date(fechaInicio);
                    fechaFin.setMonth(fechaFin.getMonth() + bono.duracionMes);
                } else {
                    fechaFin = null;
                }
                break;

            default:
                // Si llega un tipo desconocido
                await queryRunner.rollbackTransaction();
                await queryRunner.release();
                return [null, "Temporalidad desconocida"];
        }

        // Validar que fechaFin sea posterior a fechaInicio, solo si existe
        if (fechaFin && fechaFin <= fechaInicio) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, "La fecha de fin debe ser al menos un día posterior a la fecha de inicio"];
        }
        
        //Obtener data de la asignación
        const asignacionData: DeepPartial<AsignarBono> = {
            fichaEmpresa: fichaActual,
            bono: bono,
            fechaAsignacion: fechaHoyString,
            fechaFinAsignacion: fechaFin === null ? null : fechaFin,
            activo: true, // Por defecto es true si no se especifica
            observaciones: data.observaciones
        };

        // Crear la asignación de bono
        const asignacionBono = asignarBonoRepo.create(asignacionData);
        await queryRunner.manager.save(asignacionBono);

        // Registrar en historial laboral
        const montoFormateado = parseInt(bono.monto).toLocaleString('es-CL');
        const observacionesHistorial = `Asignación de bono: ${bono.nombreBono}, Monto: $${montoFormateado}, Tipo: ${bono.tipoBono}, Temporalidad: ${bono.temporalidad}, Imponible: ${bono.imponible ? 'Sí' : 'No'}${bono.descripcion ? `, Descripción del bono: ${bono.descripcion}` : ''}${fechaFin ? `, Válido hasta: ${fechaFin.toISOString().split('T')[0]}` : ''}${data.observaciones ? `
[OBSERVACIONES_BADGE]: ${data.observaciones}` : ''}`;
        
        const nuevoHistorial = new HistorialLaboral();
        nuevoHistorial.trabajador = fichaActual.trabajador;
        nuevoHistorial.cargo = 'Asignación de Bono';
        nuevoHistorial.area = 'N/A';
        nuevoHistorial.tipoContrato = 'N/A';
        nuevoHistorial.jornadaLaboral = 'N/A';
        nuevoHistorial.sueldoBase = 0;
        nuevoHistorial.fechaInicio = new Date(fechaHoyString);
        nuevoHistorial.observaciones = observacionesHistorial;
        nuevoHistorial.estado = fichaActual.estado;
        (nuevoHistorial as any).contratoURL = fichaActual.contratoURL || null;
        (nuevoHistorial as any).afp = fichaActual.afp || null;
        (nuevoHistorial as any).previsionSalud = fichaActual.previsionSalud || null;
        (nuevoHistorial as any).seguroCesantia = fichaActual.seguroCesantia || null;
        (nuevoHistorial as any).fechaInicioLicenciaPermiso = fichaActual.fechaInicioLicenciaPermiso || null;
        (nuevoHistorial as any).fechaFinLicenciaPermiso = fichaActual.fechaFinLicenciaPermiso || null;
        (nuevoHistorial as any).motivoLicenciaPermiso = fichaActual.motivoLicenciaPermiso || null;
        nuevoHistorial.registradoPor = usuarioAutenticado || fichaActual.trabajador?.usuario || null;

        await historialRepo.save(nuevoHistorial);

        await queryRunner.commitTransaction();

        return [asignacionBono, null];
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Error al asignar bono:", error);
        return [null, "Error interno del servidor"];
    } finally {
        await queryRunner.release();
    }
}

// Actualizar estado Asignación de Bono
export async function updateAsignarBonoService( id: number, idFichaActual: number, data: UpdateAsignarBonoDTO, usuarioAutenticado?: User ): Promise<ServiceResponse<AsignarBono>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const asignarBonoRepo = queryRunner.manager.getRepository(AsignarBono);
        const fichaRepo = queryRunner.manager.getRepository(FichaEmpresa);
        const bonoRepo = queryRunner.manager.getRepository(Bono);
        const historialRepo = queryRunner.manager.getRepository(HistorialLaboral);
        // Obtener la asignación de bono, bono y la ficha actual
        const asignacionBono = await asignarBonoRepo.findOne({ 
            where: { id },
            relations: ["fichaEmpresa", "fichaEmpresa.trabajador", "bono"]
        });
        const fichaActual = await fichaRepo.findOne({
            where: { id: idFichaActual },
            relations: ["trabajador", "trabajador.usuario", "asignacionesBonos", "asignacionesBonos.bono"]
        });
        const bono = await bonoRepo.findOneBy({ id: data.bonoId });
        // Validar si la ficha existe
        if (!fichaActual) {
            await queryRunner.rollbackTransaction();
            return [null, "Ficha no encontrada"];
        }
        // Validar si la asignación de bono existe
        if (!asignacionBono) {
            return [null, "Asignación de bono no encontrada"];
        }
        // Validar si el bono existe 
        if (!bono) {
            await queryRunner.rollbackTransaction();
            return [null, "Bono no encontrado"];
        }

        // Revisar si hubo cambios de actividad, observaciones o bono
        if (data.bonoId && data.bonoId !== asignacionBono.bono.id) {
            // Validar si el nuevo bono ya está asignado al trabajador
            const asignacionExistente = Array.isArray(fichaActual.asignacionesBonos)
                ? fichaActual.asignacionesBonos.filter(ab => ab.bono.id === bono.id)
                : [];
            if (asignacionExistente.length > 0) {
                await queryRunner.rollbackTransaction();
                return [null, "El bono ya está asignado a esta ficha"];
            }
        }
        
        // Verificar si hubo cambios en los campos de la asignación de bono
        const [cambios, messageSuport] = verificarCambiosBonos(asignacionBono, bono);
        if (cambios) {
            // Si hubo cambios relevantes, actualizar la asignación de bono
            asignacionBono.bono = bono;
            asignacionBono.fechaAsignacion = cambios.fechaAsignacion;
            asignacionBono.fechaFinAsignacion = cambios.fechaFinAsignacion;
            asignacionBono.activo = data.activo ?? asignacionBono.activo;
            asignacionBono.observaciones = data.observaciones ?? asignacionBono.observaciones;
            await asignarBonoRepo.save(asignacionBono);

            // Registrar cambio en historial laboral
            const montoFormateado = parseInt(bono.monto).toLocaleString('es-CL');
            const observacionesHistorial = `Actualización de asignación de bono: ${bono.nombreBono}
Monto: $${montoFormateado}, Tipo: ${bono.tipoBono}, Temporalidad: ${bono.temporalidad}, Imponible: ${bono.imponible ? 'Sí' : 'No'}, Estado: ${asignacionBono.activo ? 'Activo' : 'Inactivo'}${bono.descripcion ? `, Descripción del bono: ${bono.descripcion}` : ''}${cambios.fechaFinAsignacion ? `, Válido hasta: ${cambios.fechaFinAsignacion.toISOString().split('T')[0]}` : ''}${data.observaciones ? `
[OBSERVACIONES_BADGE]: ${data.observaciones}` : ''}`;
            
            const nuevoHistorial = new HistorialLaboral();
            nuevoHistorial.trabajador = fichaActual.trabajador;
            nuevoHistorial.cargo = 'Actualización de Bono';
            nuevoHistorial.area = 'N/A';
            nuevoHistorial.tipoContrato = 'N/A';
            nuevoHistorial.jornadaLaboral = 'N/A';
            nuevoHistorial.sueldoBase = 0;
            nuevoHistorial.fechaInicio = new Date();
            nuevoHistorial.observaciones = observacionesHistorial;
            nuevoHistorial.estado = fichaActual.estado;
            (nuevoHistorial as any).contratoURL = fichaActual.contratoURL || null;
            (nuevoHistorial as any).afp = fichaActual.afp || null;
            (nuevoHistorial as any).previsionSalud = fichaActual.previsionSalud || null;
            (nuevoHistorial as any).seguroCesantia = fichaActual.seguroCesantia || null;
            (nuevoHistorial as any).fechaInicioLicenciaPermiso = fichaActual.fechaInicioLicenciaPermiso || null;
            (nuevoHistorial as any).fechaFinLicenciaPermiso = fichaActual.fechaFinLicenciaPermiso || null;
            (nuevoHistorial as any).motivoLicenciaPermiso = fichaActual.motivoLicenciaPermiso || null;
            nuevoHistorial.registradoPor = usuarioAutenticado || fichaActual.trabajador?.usuario || null;

            await historialRepo.save(nuevoHistorial);

            await queryRunner.commitTransaction();
            // Devolver la asignación de bono actualizada
            return [asignacionBono, null];
        } else if (messageSuport === "asignacion de bono inactiva") {
            // no se puede actualizar una asignación de bono inactiva
            await queryRunner.rollbackTransaction();
            return [null, messageSuport];
        } else if (messageSuport === "SIN CAMBIOS") {
            // Si no hubo cambios relevantes, simplemente devolver la asignación de bono sin modificar
            asignacionBono.activo = data.activo ?? asignacionBono.activo;
            asignacionBono.observaciones = data.observaciones ?? asignacionBono.observaciones;
            await asignarBonoRepo.save(asignacionBono);

            // Registrar cambio de estado u observaciones en historial laboral
            if (data.activo !== undefined || data.observaciones !== undefined) {
                const montoFormateado = parseInt(asignacionBono.bono.monto).toLocaleString('es-CL');
                const observacionesHistorial = `Actualización de asignación de bono: ${asignacionBono.bono.nombreBono}, Monto: $${montoFormateado}, Tipo: ${asignacionBono.bono.tipoBono}, Temporalidad: ${asignacionBono.bono.temporalidad}, Imponible: ${asignacionBono.bono.imponible ? 'Sí' : 'No'}, Estado: ${asignacionBono.activo ? 'Activo' : 'Inactivo'}${asignacionBono.bono.descripcion ? `, Descripción del bono: ${asignacionBono.bono.descripcion}` : ''}${data.observaciones ? `
[OBSERVACIONES_BADGE]: ${data.observaciones}` : ''}`;
                
                const nuevoHistorial = new HistorialLaboral();
                nuevoHistorial.trabajador = fichaActual.trabajador;
                nuevoHistorial.cargo = 'Actualización de Bono';
                nuevoHistorial.area = 'N/A';
                nuevoHistorial.tipoContrato = 'N/A';
                nuevoHistorial.jornadaLaboral = 'N/A';
                nuevoHistorial.sueldoBase = 0;
                nuevoHistorial.fechaInicio = new Date();
                nuevoHistorial.observaciones = observacionesHistorial;
                nuevoHistorial.estado = fichaActual.estado;
                (nuevoHistorial as any).contratoURL = fichaActual.contratoURL || null;
                (nuevoHistorial as any).afp = fichaActual.afp || null;
                (nuevoHistorial as any).previsionSalud = fichaActual.previsionSalud || null;
                (nuevoHistorial as any).seguroCesantia = fichaActual.seguroCesantia || null;
                (nuevoHistorial as any).fechaInicioLicenciaPermiso = fichaActual.fechaInicioLicenciaPermiso || null;
                (nuevoHistorial as any).fechaFinLicenciaPermiso = fichaActual.fechaFinLicenciaPermiso || null;
                (nuevoHistorial as any).motivoLicenciaPermiso = fichaActual.motivoLicenciaPermiso || null;
                nuevoHistorial.registradoPor = usuarioAutenticado || fichaActual.trabajador?.usuario || null;

                await historialRepo.save(nuevoHistorial);
            }

            await queryRunner.commitTransaction();
            return [asignacionBono, null];
        }
        // Devolver la asignación de bono actualizada
        return [asignacionBono, null];
    } catch (error) {
        console.error("Error al actualizar asignación de bono:", error);
        return [null, "Error interno del servidor"];
    }
}

// Obtener las asignaciones por fichaEmpresa
export async function getAsignacionesByFichaService(idFicha: number): Promise<ServiceResponse<AsignarBono[]>> {
    try {
        const asignarBonoRepo = AppDataSource.getRepository(AsignarBono);
        const asignaciones = await asignarBonoRepo.find({
            where: { fichaEmpresa: { id: idFicha } },
            relations: ["fichaEmpresa", "fichaEmpresa.trabajador", "bono"]
        });
        return [asignaciones, null];
    } catch (error) {
        console.error("Error al obtener asignaciones:", error);
        return [null, "Error interno del servidor"];
    }   
}

export async function verificarEstadoAsignacionBonoService(): Promise<ServiceResponse<{ desactivadas: number }>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
        const asignarBonoRepo = queryRunner.manager.getRepository(AsignarBono);

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        let desactivadas = 0;

        // Desactivar asignaciones que hayan expirado
        const asignacionesExpiradas = await asignarBonoRepo.find({
            where: {
                fechaFinAsignacion: LessThanOrEqual(hoy),
                activo: true
            },
            relations: ["fichaEmpresa", "fichaEmpresa.trabajador", "bono"]
        });

        for (const asignacion of asignacionesExpiradas) {
            asignacion.activo = false;
            await asignarBonoRepo.save(asignacion);
            desactivadas++;
        }

        await queryRunner.commitTransaction();
        return [{ desactivadas }, null];
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Error al verificar estado de asignación de bono:", error);
        return [null, "Error interno del servidor"];
    }finally {
        await queryRunner.release();
    }
}