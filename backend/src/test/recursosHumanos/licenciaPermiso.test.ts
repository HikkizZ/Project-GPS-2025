// @ts-ignore
import { expect } from 'chai';
// @ts-ignore
import request from 'supertest';
import { app, server, SUPER_ADMIN_CREDENTIALS, RRHH_CREDENTIALS } from '../setup.js';
import { AppDataSource } from '../../config/configDB.js';
import { LicenciaPermiso } from '../../entity/recursosHumanos/licenciaPermiso.entity.js';
import { Trabajador } from '../../entity/recursosHumanos/trabajador.entity.js';
import { EstadoLaboral } from '../../entity/recursosHumanos/fichaEmpresa.entity.js';
import { EstadoSolicitud, TipoSolicitud } from '../../entity/recursosHumanos/licenciaPermiso.entity.js';
import { FichaEmpresa } from '../../entity/recursosHumanos/fichaEmpresa.entity.js';
import path from 'path';
import fs from 'fs';
import { User } from '../../entity/user.entity.js';

describe('📋 Licencias y Permisos API', () => {
    let adminToken: string;
    let rrhToken: string;
    let usuarioToken: string;
    let fichaId: number;
    let trabajadorId: number;
    let licenciaId: number;
    let uniqueEmail: string;

    before(async () => {
        try {
            console.log("✅ Iniciando pruebas de Licencias y Permisos");

            // Obtener token de SuperAdmin
            const adminLogin = await request(app)
                .post('/api/auth/login')
                .send(SUPER_ADMIN_CREDENTIALS);

            adminToken = adminLogin.body.data.token;

            // Login como RRHH
            const rrhLogin = await request(app)
                .post('/api/auth/login')
                .send(RRHH_CREDENTIALS);

            rrhToken = rrhLogin.body.data.token;

            const uniqueEmail = `maria.gonzalez.${Date.now()}@gmail.com`;
            
            // Crear trabajador de prueba con RUT válido
            console.log('🔄 Creando trabajador para licenciaPermiso...');
            const trabajadorResponse = await request(app)
                .post('/api/trabajador')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    nombres: "María José",
                    apellidoPaterno: "González",
                    apellidoMaterno: "Torres",
                    rut: "28.123.456-0",
                    fechaNacimiento: "1987-03-10",
                    telefono: "+56966666666",
                    correo: uniqueEmail,
                    numeroEmergencia: "+56977777777",
                    direccion: "Av. Licencias 456",
                    fechaIngreso: "2024-01-01",
                    fichaEmpresa: {
                        cargo: "Coordinadora",
                        area: "Administración",
                        tipoContrato: "Indefinido",
                        jornadaLaboral: "Completa",
                        sueldoBase: 1300000,
                        fechaInicioContrato: "2024-01-01"
                    }
                });

            console.log('📊 Response trabajador licenciaPermiso:', {
                status: trabajadorResponse.status,
                hasData: !!trabajadorResponse.body.data,
                id: trabajadorResponse.body.data?.id,
                message: trabajadorResponse.body.message || 'Sin mensaje'
            });

            if (trabajadorResponse.status !== 201 || !trabajadorResponse.body.data?.id) {
                throw new Error(`No se pudo crear trabajador: ${trabajadorResponse.body.message || 'Error desconocido'}`);
            }

            trabajadorId = trabajadorResponse.body.data.id;
            fichaId = trabajadorResponse.body.data.fichaEmpresa.id;
            console.log('✅ Trabajador licenciaPermiso creado:', { trabajadorId, fichaId });

            // Registrar usuario para el trabajador
            console.log('🔄 Registrando usuario licenciaPermiso...');
            const registerResponse = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    name: "María José González",
                    email: uniqueEmail,
                    password: "Maria2024",
                    rut: "28.123.456-0",
                    role: "Usuario"
                });

            console.log('📊 Response register licenciaPermiso:', {
                status: registerResponse.status,
                message: registerResponse.body.message || 'Sin mensaje'
            });

            if (registerResponse.status !== 201) {
                throw new Error(`No se pudo registrar usuario: ${registerResponse.body.message || 'Error desconocido'}`);
            }

            // Login como usuario
            console.log('🔄 Login como usuario licenciaPermiso...');
            const userLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: uniqueEmail,
                    password: "Maria2024"
                });

            console.log('📊 Response login licenciaPermiso:', {
                status: userLogin.status,
                hasToken: !!userLogin.body.data?.token
            });

            if (userLogin.status !== 200 || !userLogin.body.data?.token) {
                throw new Error(`No se pudo hacer login: ${userLogin.body.message || 'Error desconocido'}`);
            }

            usuarioToken = userLogin.body.data.token;
            console.log('✅ Setup de licenciaPermiso completado exitosamente');

        } catch (error) {
            console.error("❌ Error en la configuración de pruebas de licenciaPermiso:", error);
            throw error;
        }
    });

    describe('📝 Solicitud de Licencias y Permisos', () => {
        it('debe permitir a un usuario solicitar una licencia', async () => {
            console.log('🔄 Iniciando solicitud de licencia...');
            
            // Crear archivo PDF de prueba
            const testPdfPath = path.join(process.cwd(), 'test-files', 'licencia.pdf');
            const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n192\n%%EOF';
            
            const testFilesDir = path.dirname(testPdfPath);
            if (!fs.existsSync(testFilesDir)) {
                fs.mkdirSync(testFilesDir, { recursive: true });
            }
            fs.writeFileSync(testPdfPath, testPdfContent);

            const fechaInicio = new Date();
            fechaInicio.setDate(fechaInicio.getDate() + 1);
            const fechaFin = new Date();
            fechaFin.setDate(fechaFin.getDate() + 3);

            const response = await request(app)
                .post('/api/licencia-permiso')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .field('tipo', 'LICENCIA')
                .field('motivo', 'Licencia médica por enfermedad')
                .field('fechaInicio', fechaInicio.toISOString().split('T')[0])
                .field('fechaFin', fechaFin.toISOString().split('T')[0])
                .attach('archivo', testPdfPath);

            console.log('📊 Response solicitud licencia:', {
                status: response.status,
                message: response.body.message || 'Sin mensaje',
                hasData: !!response.body.data,
                error: response.body.error || 'Sin error específico'
            });

            // Limpiar archivo
            if (fs.existsSync(testPdfPath)) {
                fs.unlinkSync(testPdfPath);
            }

            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal("success");
            expect(response.body.data).to.have.property("id");
            
            licenciaId = response.body.data.id;
        });

        it('debe validar las fechas de la solicitud', async () => {
            const response = await request(app)
                .post('/api/licencia-permiso')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    tipo: TipoSolicitud.PERMISO,
                    fechaInicio: "2024-03-15",
                    fechaFin: "2024-03-01", // Fecha fin anterior a inicio
                    motivoSolicitud: "Permiso administrativo"
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
        });
    });

    describe('👀 Revisión de Solicitudes', () => {
        it('debe permitir a RRHH aprobar una licencia', async () => {
            console.log('🔄 Iniciando aprobación de licencia...');
            console.log('📊 ID de licencia a aprobar:', licenciaId);

            if (!licenciaId) {
                throw new Error('No hay licencia creada para aprobar');
            }

            const response = await request(app)
                .put(`/api/licencia-permiso/${licenciaId}`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    accion: 'APROBAR',
                    comentarios: 'Licencia aprobada por RRHH'
                });

            console.log('📊 Response aprobación licencia:', {
                status: response.status,
                message: response.body.message || 'Sin mensaje',
                hasData: !!response.body.data,
                error: response.body.error || 'Sin error específico'
            });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
        });

        it('debe permitir a RRHH rechazar una solicitud', async () => {
            console.log('🔄 Iniciando rechazo de solicitud...');
            
            // Crear nueva solicitud para rechazar
            const fechaInicio = new Date();
            fechaInicio.setDate(fechaInicio.getDate() + 5);
            const fechaFin = new Date();
            fechaFin.setDate(fechaFin.getDate() + 7);

            const solicitudResponse = await request(app)
                .post('/api/licencia-permiso')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    tipo: 'PERMISO',
                    motivo: 'Permiso personal',
                    fechaInicio: fechaInicio.toISOString().split('T')[0],
                    fechaFin: fechaFin.toISOString().split('T')[0]
                });

            console.log('📊 Response nueva solicitud para rechazar:', {
                status: solicitudResponse.status,
                hasData: !!solicitudResponse.body.data,
                id: solicitudResponse.body.data?.id
            });

            if (!solicitudResponse.body.data?.id) {
                throw new Error('No se pudo crear solicitud para rechazar');
            }

            const solicitudId = solicitudResponse.body.data.id;

            const response = await request(app)
                .put(`/api/licencia-permiso/${solicitudId}`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    accion: 'RECHAZAR',
                    comentarios: 'Solicitud rechazada por falta de documentación'
                });

            console.log('📊 Response rechazo solicitud:', {
                status: response.status,
                message: response.body.message || 'Sin mensaje'
            });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
        });
    });

    describe('🔄 Verificación Automática de Vencimientos', () => {
        it('debe actualizar el estado cuando vence una licencia', async () => {
            // Modificar la fecha de fin de la licencia al pasado
            const queryRunner = AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                const licenciaRepo = queryRunner.manager.getRepository(LicenciaPermiso);
                const licencia = await licenciaRepo.findOne({ where: { id: licenciaId } });
                
                if (licencia) {
                    licencia.fechaFin = new Date(Date.now() - 24 * 60 * 60 * 1000); // Ayer
                    await licenciaRepo.save(licencia);
                }

                await queryRunner.commitTransaction();
            } finally {
                await queryRunner.release();
            }

            // Ejecutar verificación
            const response = await request(app)
                .post('/api/licencia-permiso/verificar-vencimientos')
                .set('Authorization', `Bearer ${rrhToken}`);

            console.log('📊 Response verificación vencimientos:', { status: response.status, message: response.body.message });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");

            // Verificar que el estado de la ficha volvió a ACTIVO
            const fichaResponse = await request(app)
                .get(`/api/ficha-empresa/${fichaId}`)
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(fichaResponse.body.data.estado).to.equal(EstadoLaboral.ACTIVO);
        });

        it('no debe modificar estados de licencias vigentes', async () => {
            console.log('🔄 Verificando estados de licencias vigentes...');
            
            // Crear licencia vigente
            const fechaInicio = new Date();
            fechaInicio.setDate(fechaInicio.getDate() - 1); // Ayer
            const fechaFin = new Date();
            fechaFin.setDate(fechaFin.getDate() + 5); // En 5 días

            const licenciaVigenteResponse = await request(app)
                .post('/api/licencia-permiso')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    tipo: 'LICENCIA',
                    motivo: 'Licencia vigente',
                    fechaInicio: fechaInicio.toISOString().split('T')[0],
                    fechaFin: fechaFin.toISOString().split('T')[0]
                });

            console.log('📊 Response licencia vigente:', {
                status: licenciaVigenteResponse.status,
                hasData: !!licenciaVigenteResponse.body.data,
                id: licenciaVigenteResponse.body.data?.id
            });

            if (!licenciaVigenteResponse.body.data?.id) {
                throw new Error('No se pudo crear licencia vigente');
            }

            const licenciaVigenteId = licenciaVigenteResponse.body.data.id;

            // Aprobar la licencia para que sea vigente
            await request(app)
                .put(`/api/licencia-permiso/${licenciaVigenteId}`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    accion: 'APROBAR',
                    comentarios: 'Aprobada'
                });

            // Verificar vencimientos
            const response = await request(app)
                .post('/api/licencia-permiso/verificar-vencimientos')
                .set('Authorization', `Bearer ${rrhToken}`);

            console.log('📊 Response verificación vencimientos:', { status: response.status, message: response.body.message });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
        });
    });

    after(async () => {
        try {
            console.log("✅ Pruebas de Licencias y Permisos completadas");
        } catch (error) {
            console.error("Error en la limpieza de pruebas:", error);
        }
    });
}); 