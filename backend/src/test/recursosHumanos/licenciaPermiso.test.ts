import { expect } from 'chai';
import { Application } from 'express';
import request from 'supertest';
import { setupTestApp, closeTestApp } from '../setup.js';
import { EstadoLaboral } from '../../entity/recursosHumanos/fichaEmpresa.entity.js';
import { EstadoSolicitud, TipoSolicitud } from '../../entity/recursosHumanos/licenciaPermiso.entity.js';
import { AppDataSource } from '../../config/configDB.js';
import { FichaEmpresa } from '../../entity/recursosHumanos/fichaEmpresa.entity.js';
import { LicenciaPermiso } from '../../entity/recursosHumanos/licenciaPermiso.entity.js';

describe('📋 Licencias y Permisos API', () => {
    let app: Application;
    let server: any;
    let rrhToken: string;
    let usuarioToken: string;
    let fichaId: number;
    let trabajadorId: number;
    let licenciaId: number;

    before(async () => {
        try {
            const setup = await setupTestApp();
            app = setup.app;
            server = setup.server;

            // Login como RRHH
            const rrhLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'recursoshumanos@gmail.com',
                    password: 'RRHH2024'
                });

            rrhToken = rrhLogin.body.data.token;

            // Crear trabajador de prueba
            const trabajadorResponse = await request(app)
                .post('/api/trabajador')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    nombres: "Test",
                    apellidoPaterno: "Licencia",
                    apellidoMaterno: "Permiso",
                    rut: "66.666.666-6",
                    fechaNacimiento: "1990-01-01",
                    telefono: "+56912345678",
                    correo: "test.licencia@gmail.com",
                    numeroEmergencia: "+56987654321",
                    direccion: "Av. Test 123",
                    fechaIngreso: "2024-01-01",
                    fichaEmpresa: {
                        cargo: "Tester",
                        area: "QA",
                        empresa: "GPS",
                        tipoContrato: "Indefinido",
                        jornadaLaboral: "Completa",
                        sueldoBase: 1000000
                    }
                });

            trabajadorId = trabajadorResponse.body.data.id;
            fichaId = trabajadorResponse.body.data.fichaEmpresa.id;

            // Registrar y login como usuario
            await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    rut: "66.666.666-6",
                    email: "test.licencia@gmail.com",
                    password: "Test2024",
                    role: "Usuario",
                    name: "Test Licencia"
                });

            const userLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: "test.licencia@gmail.com",
                    password: "Test2024"
                });

            usuarioToken = userLogin.body.data.token;
        } catch (error) {
            console.error('Error en la configuración de pruebas:', error);
            throw error;
        }
    });

    describe('📝 Solicitud de Licencias y Permisos', () => {
        it('debe permitir a un usuario solicitar una licencia', async () => {
            const response = await request(app)
                .post('/api/licencia-permiso')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    tipo: TipoSolicitud.LICENCIA,
                    fechaInicio: "2024-03-01",
                    fechaFin: "2024-03-15",
                    motivoSolicitud: "Licencia médica por resfrío",
                    archivoAdjuntoURL: "https://example.com/licencia.pdf"
                });

            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal("success");
            expect(response.body.data).to.have.property('estado', EstadoSolicitud.PENDIENTE);
            
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
            const response = await request(app)
                .put(`/api/licencia-permiso/${licenciaId}`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    estadoSolicitud: EstadoSolicitud.APROBADA,
                    respuestaEncargado: "Licencia médica aprobada"
                });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data.estado).to.equal(EstadoSolicitud.APROBADA);

            // Verificar que el estado de la ficha se actualizó
            const fichaResponse = await request(app)
                .get(`/api/ficha-empresa/${fichaId}`)
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(fichaResponse.body.data.estado).to.equal(EstadoLaboral.LICENCIA);
        });

        it('debe permitir a RRHH rechazar una solicitud', async () => {
            // Crear nueva solicitud
            const solicitudResponse = await request(app)
                .post('/api/licencia-permiso')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    tipo: TipoSolicitud.PERMISO,
                    fechaInicio: "2024-04-01",
                    fechaFin: "2024-04-02",
                    motivoSolicitud: "Permiso administrativo"
                });

            const permisoId = solicitudResponse.body.data.id;

            const response = await request(app)
                .put(`/api/licencia-permiso/${permisoId}`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    estadoSolicitud: EstadoSolicitud.RECHAZADA,
                    respuestaEncargado: "No hay personal disponible para cubrir"
                });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data.estado).to.equal(EstadoSolicitud.RECHAZADA);

            // Verificar que el estado de la ficha NO cambió
            const fichaResponse = await request(app)
                .get(`/api/ficha-empresa/${fichaId}`)
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(fichaResponse.body.data.estado).to.equal(EstadoLaboral.LICENCIA);
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

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");

            // Verificar que el estado de la ficha volvió a ACTIVO
            const fichaResponse = await request(app)
                .get(`/api/ficha-empresa/${fichaId}`)
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(fichaResponse.body.data.estado).to.equal(EstadoLaboral.ACTIVO);
        });

        it('no debe modificar estados de licencias vigentes', async () => {
            // Crear una nueva licencia vigente
            const solicitudResponse = await request(app)
                .post('/api/licencia-permiso')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    tipo: TipoSolicitud.LICENCIA,
                    fechaInicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mañana
                    fechaFin: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 días después
                    motivoSolicitud: "Nueva licencia médica",
                    archivoAdjuntoURL: "https://example.com/nueva-licencia.pdf"
                });

            const nuevaLicenciaId = solicitudResponse.body.data.id;

            // Aprobar la licencia
            await request(app)
                .put(`/api/licencia-permiso/${nuevaLicenciaId}`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    estadoSolicitud: EstadoSolicitud.APROBADA,
                    respuestaEncargado: "Licencia aprobada"
                });

            // Ejecutar verificación
            const response = await request(app)
                .post('/api/licencia-permiso/verificar-vencimientos')
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(response.status).to.equal(200);

            // Verificar que el estado sigue en LICENCIA
            const fichaResponse = await request(app)
                .get(`/api/ficha-empresa/${fichaId}`)
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(fichaResponse.body.data.estado).to.equal(EstadoLaboral.LICENCIA);
        });
    });

    after(async () => {
        await closeTestApp();
    });
}); 