import { expect } from 'chai';
import { Application } from 'express';
import request from 'supertest';
import { setupTestApp, closeTestApp } from '../setup.js';
import { TipoCambioLaboral } from '../../types/recursosHumanos/cambiosLaborales.types.js';
import { EstadoLaboral } from '../../entity/recursosHumanos/fichaEmpresa.entity.js';

describe('🔄 Cambios Laborales API', () => {
    let app: Application;
    let server: any;
    let adminToken: string;
    let rrhToken: string;
    let usuarioToken: string;
    let trabajadorId: number;
    let fichaId: number;

    before(async () => {
        try {
            const uniqueEmail = `test.cambios.${Date.now()}@gmail.com`;
            
            const setup = await setupTestApp();
            app = setup.app;
            server = setup.server;

            // Login como admin
            const adminLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin.principal@gmail.com',
                    password: '204dm1n8'
                });

            adminToken = adminLogin.body.data.token;

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
                    apellidoPaterno: "Cambios",
                    apellidoMaterno: "Laborales",
                    rut: "37.890.123-8",
                    fechaNacimiento: "1990-01-01",
                    telefono: "+56912345678",
                    correo: uniqueEmail,
                    numeroEmergencia: "+56987654321",
                    direccion: "Av. Test 123",
                    fechaIngreso: "2024-01-01",
                    fichaEmpresa: {
                        cargo: "Desarrollador",
                        area: "TI",
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
                    rut: "37.890.123-8",
                    email: uniqueEmail,
                    password: "Test2024",
                    role: "Usuario",
                    name: "Test Cambios"
                });

            const userLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: uniqueEmail,
                    password: "Test2024"
                });

            usuarioToken = userLogin.body.data.token;

        } catch (error) {
            console.error('Error en la configuración de pruebas:', error);
            throw error;
        }
    });

    describe('📝 Procesamiento de Cambios Laborales', () => {
        it('debe permitir a RRHH realizar un cambio de cargo', async () => {
            const response = await request(app)
                .post('/api/cambios-laborales/procesar')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    tipo: TipoCambioLaboral.CAMBIO_CARGO,
                    trabajadorId: trabajadorId,
                    fechaInicio: "2024-02-01",
                    motivo: "Promoción por buen desempeño",
                    cargo: "Desarrollador Senior"
                });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data.cambiosRealizados.fichaEmpresa).to.be.true;
            expect(response.body.data.cambiosRealizados.historialLaboral).to.be.true;
        });

        it('debe permitir a RRHH realizar un cambio de área', async () => {
            const response = await request(app)
                .post('/api/cambios-laborales/procesar')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    tipo: TipoCambioLaboral.CAMBIO_AREA,
                    trabajadorId: trabajadorId,
                    fechaInicio: "2024-02-15",
                    motivo: "Reorganización departamental",
                    area: "Desarrollo Mobile"
                });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data.cambiosRealizados.fichaEmpresa).to.be.true;
        });

        it('debe permitir a RRHH realizar un cambio de sueldo', async () => {
            const response = await request(app)
                .post('/api/cambios-laborales/procesar')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    tipo: TipoCambioLaboral.CAMBIO_SUELDO,
                    trabajadorId: trabajadorId,
                    fechaInicio: "2024-03-01",
                    motivo: "Ajuste salarial anual",
                    sueldoBase: 1200000
                });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data.cambiosRealizados.fichaEmpresa).to.be.true;
        });

        it('debe permitir a RRHH realizar una desvinculación', async () => {
            const response = await request(app)
                .post('/api/cambios-laborales/procesar')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    tipo: TipoCambioLaboral.DESVINCULACION,
                    trabajadorId: trabajadorId,
                    fechaInicio: "2024-03-15",
                    motivo: "Término de contrato por mutuo acuerdo"
                });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data.cambiosRealizados.fichaEmpresa).to.be.true;
            expect(response.body.data.cambiosRealizados.trabajador).to.be.true;

            // Verificar que el estado cambió a DESVINCULADO
            const fichaResponse = await request(app)
                .get(`/api/ficha-empresa/${fichaId}`)
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(fichaResponse.body.data.estado).to.equal(EstadoLaboral.DESVINCULADO);
        });

        it('no debe permitir cambios en un trabajador desvinculado', async () => {
            const response = await request(app)
                .post('/api/cambios-laborales/procesar')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    tipo: TipoCambioLaboral.CAMBIO_CARGO,
                    trabajadorId: trabajadorId,
                    fechaInicio: "2024-03-16",
                    motivo: "Intento de cambio post desvinculación",
                    cargo: "Otro cargo"
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.message).to.include("No se pueden realizar cambios en un trabajador desvinculado");
        });

        it('no debe permitir a un usuario normal procesar cambios', async () => {
            const response = await request(app)
                .post('/api/cambios-laborales/procesar')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    tipo: TipoCambioLaboral.CAMBIO_CARGO,
                    trabajadorId: trabajadorId,
                    fechaInicio: "2024-02-01",
                    motivo: "Intento no autorizado",
                    cargo: "Hacker"
                });

            expect(response.status).to.equal(403);
            expect(response.body.status).to.equal("error");
        });

        it('debe validar los campos requeridos según el tipo de cambio', async () => {
            const response = await request(app)
                .post('/api/cambios-laborales/procesar')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    tipo: TipoCambioLaboral.CAMBIO_SUELDO,
                    trabajadorId: trabajadorId,
                    fechaInicio: "2024-02-01",
                    motivo: "Cambio sin sueldo especificado"
                    // Falta sueldoBase
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.message).to.include("sueldo base");
        });

        it('no debe permitir disminuir el sueldo', async () => {
            // Crear nuevo trabajador para esta prueba
            const nuevoTrabajadorResponse = await request(app)
                .post('/api/trabajador')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    nombres: "Test",
                    apellidoPaterno: "Sueldo",
                    apellidoMaterno: "Menor",
                    rut: "30.345.678-3",
                    fechaNacimiento: "1990-01-01",
                    telefono: "+56912345678",
                    correo: "test.sueldo@gmail.com",
                    numeroEmergencia: "+56987654321",
                    direccion: "Av. Test 123",
                    fechaIngreso: "2024-01-01",
                    fichaEmpresa: {
                        cargo: "Desarrollador",
                        area: "TI",
                        empresa: "GPS",
                        tipoContrato: "Indefinido",
                        jornadaLaboral: "Completa",
                        sueldoBase: 1000000
                    }
                });

            const nuevoTrabajadorId = nuevoTrabajadorResponse.body.data.id;

            const response = await request(app)
                .post('/api/cambios-laborales/procesar')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    tipo: TipoCambioLaboral.CAMBIO_SUELDO,
                    trabajadorId: nuevoTrabajadorId,
                    fechaInicio: "2024-02-01",
                    motivo: "Intento de reducción salarial",
                    sueldoBase: 800000
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.message).to.include("El nuevo sueldo no puede ser menor al actual");

            // Limpiar el trabajador creado para esta prueba
            await request(app)
                .delete(`/api/trabajador/${nuevoTrabajadorId}`)
                .set('Authorization', `Bearer ${rrhToken}`);
        });

        it('debe permitir a RRHH realizar un cambio de contrato', async () => {
            console.log('🔄 Iniciando prueba de cambio de contrato...');
            
            // Crear trabajador con RUT válido
            const trabajadorData = {
                nombres: "Pedro",
                apellidoPaterno: "López",
                apellidoMaterno: "Martínez",
                rut: "31.456.789-7",
                fechaNacimiento: "1988-03-15",
                telefono: "+56911111111",
                correo: "pedro.lopez@test.com",
                numeroEmergencia: "+56922222222",
                direccion: "Calle Nueva 789",
                fechaIngreso: "2024-01-01",
                fichaEmpresa: {
                    cargo: "Desarrollador",
                    area: "Tecnología",
                    empresa: "GPS",
                    tipoContrato: "Plazo Fijo",
                    jornadaLaboral: "Completa",
                    sueldoBase: 1000000
                }
            };

            const trabajadorResponse = await request(app)
                .post('/api/trabajador')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send(trabajadorData);

            console.log('📊 Response trabajador cambio contrato:', {
                status: trabajadorResponse.status,
                hasData: !!trabajadorResponse.body.data,
                id: trabajadorResponse.body.data?.id,
                message: trabajadorResponse.body.message || 'Sin mensaje'
            });

            if (trabajadorResponse.status !== 201 || !trabajadorResponse.body.data?.id) {
                throw new Error(`No se pudo crear trabajador: ${trabajadorResponse.body.message || 'Error desconocido'}`);
            }

            const trabajadorIdContrato = trabajadorResponse.body.data.id;

            const response = await request(app)
                .post('/api/cambios-laborales/procesar')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    trabajadorId: trabajadorIdContrato,
                    tipoCambio: 'CAMBIO_CONTRATO',
                    nuevoDato: 'Indefinido'
                });

            console.log('📊 Response cambio contrato:', {
                status: response.status,
                message: response.body.message || 'Sin mensaje'
            });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");

            // Limpiar
            await request(app)
                .delete(`/api/trabajador/${trabajadorIdContrato}`)
                .set('Authorization', `Bearer ${rrhToken}`);
        });

        it('debe permitir a RRHH realizar un cambio de jornada', async () => {
            console.log('🔄 Iniciando prueba de cambio de jornada...');
            
            // Crear trabajador con RUT válido
            const trabajadorData = {
                nombres: "Ana",
                apellidoPaterno: "Sánchez",
                apellidoMaterno: "Rivera",
                rut: "32.567.890-9",
                fechaNacimiento: "1992-07-22",
                telefono: "+56933333333",
                correo: "ana.sanchez@test.com",
                numeroEmergencia: "+56944444444",
                direccion: "Av. Principal 456",
                fechaIngreso: "2024-01-01",
                fichaEmpresa: {
                    cargo: "Analista",
                    area: "Finanzas",
                    empresa: "GPS",
                    tipoContrato: "Indefinido",
                    jornadaLaboral: "Completa",
                    sueldoBase: 950000
                }
            };

            const trabajadorResponse = await request(app)
                .post('/api/trabajador')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send(trabajadorData);

            console.log('📊 Response trabajador cambio jornada:', {
                status: trabajadorResponse.status,
                hasData: !!trabajadorResponse.body.data,
                id: trabajadorResponse.body.data?.id,
                message: trabajadorResponse.body.message || 'Sin mensaje'
            });

            if (trabajadorResponse.status !== 201 || !trabajadorResponse.body.data?.id) {
                throw new Error(`No se pudo crear trabajador: ${trabajadorResponse.body.message || 'Error desconocido'}`);
            }

            const trabajadorIdJornada = trabajadorResponse.body.data.id;

            const response = await request(app)
                .post('/api/cambios-laborales/procesar')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    trabajadorId: trabajadorIdJornada,
                    tipoCambio: 'CAMBIO_JORNADA',
                    nuevoDato: 'Parcial'
                });

            console.log('📊 Response cambio jornada:', {
                status: response.status,
                message: response.body.message || 'Sin mensaje'
            });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");

            // Limpiar
            await request(app)
                .delete(`/api/trabajador/${trabajadorIdJornada}`)
                .set('Authorization', `Bearer ${rrhToken}`);
        });
    });

    after(async () => {
        if (server) {
            await closeTestApp();
        }
    });
}); 