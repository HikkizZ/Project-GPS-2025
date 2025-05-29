import { expect } from 'chai';
import { Application } from 'express';
import request from 'supertest';
import { setupTestApp, closeTestApp } from '../setup.js';
import { EstadoLaboral } from '../../entity/recursosHumanos/fichaEmpresa.entity.js';

describe('📋 Ficha Empresa API', () => {
    let app: Application;
    let server: any;
    let adminToken: string;
    let rrhToken: string;
    let usuarioToken: string;
    let fichaId: number;
    let trabajadorId: number;

    before(async () => {
        try {
            // Configurar el servidor y la base de datos
            const setup = await setupTestApp();
            app = setup.app;
            server = setup.server;

            // Login como admin
            const adminLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin.principal@gmail.com',
                    password: 'Admin2024'
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

            // Crear un trabajador de prueba con ficha empresa
            const trabajadorResponse = await request(app)
                .post('/api/trabajador')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    nombres: "Juan Test",
                    apellidoPaterno: "Ficha",
                    apellidoMaterno: "Empresa",
                    rut: "44.444.444-4",
                    fechaNacimiento: "1990-01-01",
                    telefono: "+56912345678",
                    correo: "juan.ficha.test@gmail.com",
                    numeroEmergencia: "+56987654321",
                    direccion: "Av. Test 123",
                    fechaIngreso: "2024-01-01",
                    fichaEmpresa: {
                        cargo: "Desarrollador Test",
                        area: "TI",
                        empresa: "GPS",
                        tipoContrato: "Indefinido",
                        jornadaLaboral: "Completa",
                        sueldoBase: 1000000,
                        contratoURL: "https://example.com/contratos/test.pdf"
                    }
                });

            if (!trabajadorResponse.body.data?.fichaEmpresa?.id) {
                console.error('Error: No se pudo obtener el ID de la ficha:', trabajadorResponse.body);
                throw new Error('No se pudo obtener el ID de la ficha empresa');
            }

            trabajadorId = trabajadorResponse.body.data.id;
            fichaId = trabajadorResponse.body.data.fichaEmpresa.id;

            console.log('IDs obtenidos:', { trabajadorId, fichaId });

            // Login como el nuevo trabajador
            const userResponse = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    rut: "44.444.444-4",
                    email: "juan.ficha.test@gmail.com",
                    password: "Test2024",
                    role: "Usuario",
                    name: "Juan Test Ficha"
                });

            if (userResponse.status !== 201) {
                console.error('Error en registro de usuario:', userResponse.body);
                throw new Error('No se pudo registrar el usuario de prueba');
            }

            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar un momento antes del login

            const userLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: "juan.ficha.test@gmail.com",
                    password: "Test2024"
                });

            if (userLogin.status !== 200 || !userLogin.body.data?.token) {
                console.error('Error en login de usuario:', userLogin.body);
                throw new Error('No se pudo obtener el token del usuario');
            }

            usuarioToken = userLogin.body.data.token;

        } catch (error) {
            console.error('Error en la configuración de pruebas:', error);
            throw error;
        }
    });

    describe('🔍 Consulta de Fichas', () => {
        it('debe permitir a un trabajador ver su propia ficha', async () => {
            const response = await request(app)
                .get('/api/ficha-empresa/mi-ficha')
                .set('Authorization', `Bearer ${usuarioToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data).to.have.property("cargo", "Desarrollador Test");
        });

        it('debe permitir a RRHH buscar fichas', async () => {
            const response = await request(app)
                .get('/api/ficha-empresa/search')
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data).to.be.an('array');
            expect(response.body.data.length).to.be.greaterThan(0);
        });

        it('debe permitir a RRHH ver una ficha específica', async () => {
            const response = await request(app)
                .get(`/api/ficha-empresa/${fichaId}`)
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data.id).to.equal(fichaId);
        });

        it('no debe permitir a un trabajador ver fichas de otros', async () => {
            const response = await request(app)
                .get(`/api/ficha-empresa/${fichaId}`)
                .set('Authorization', `Bearer ${usuarioToken}`);

            expect(response.status).to.equal(403);
            expect(response.body.status).to.equal("error");
        });
    });

    describe('✏️ Actualización de Fichas', () => {
        it('debe permitir a RRHH actualizar una ficha', async () => {
            const response = await request(app)
                .put(`/api/ficha-empresa/${fichaId}`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    cargo: "Senior Developer",
                    sueldoBase: 1500000
                });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data.cargo).to.equal("Senior Developer");
            expect(response.body.data.sueldoBase).to.equal(1500000);
        });

        it('no debe permitir actualizar campos protegidos', async () => {
            const response = await request(app)
                .put(`/api/ficha-empresa/${fichaId}`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    fechaInicioContrato: "2023-01-01"
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
        });

        it('debe validar el formato de los campos', async () => {
            const response = await request(app)
                .put(`/api/ficha-empresa/${fichaId}`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    sueldoBase: -1000
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
        });

        it('no debe permitir a un usuario normal actualizar fichas', async () => {
            const response = await request(app)
                .put(`/api/ficha-empresa/${fichaId}`)
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    cargo: "Hacker"
                });

            expect(response.status).to.equal(403);
            expect(response.body.status).to.equal("error");
        });
    });

    describe('📊 Estados de Ficha', () => {
        it('debe permitir a RRHH cambiar el estado de una ficha', async () => {
            const response = await request(app)
                .put(`/api/ficha-empresa/${fichaId}/estado`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    estado: EstadoLaboral.LICENCIA,
                    fechaInicio: "2024-03-01",
                    fechaFin: "2024-03-15",
                    motivo: "Licencia médica"
                });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data.estado).to.equal(EstadoLaboral.LICENCIA);
        });

        it('debe validar las fechas al cambiar estado', async () => {
            const response = await request(app)
                .put(`/api/ficha-empresa/${fichaId}/estado`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    estado: EstadoLaboral.PERMISO,
                    fechaInicio: "2024-03-15",
                    fechaFin: "2024-03-01" // Fecha fin anterior a inicio
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
        });

        it('debe requerir fechas para estados temporales', async () => {
            const response = await request(app)
                .put(`/api/ficha-empresa/${fichaId}/estado`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    estado: EstadoLaboral.PERMISO
                    // Sin fechas
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
        });
    });

    describe('📄 Contratos', () => {
        it('debe permitir descargar contrato al dueño de la ficha', async () => {
            const response = await request(app)
                .get(`/api/ficha-empresa/${fichaId}/contrato`)
                .set('Authorization', `Bearer ${usuarioToken}`);

            expect(response.status).to.equal(200);
        });

        it('debe permitir a RRHH descargar cualquier contrato', async () => {
            const response = await request(app)
                .get(`/api/ficha-empresa/${fichaId}/contrato`)
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(response.status).to.equal(200);
        });

        it('no debe permitir descargar contratos de otros usuarios', async () => {
            // Crear otro trabajador y su ficha
            const otroTrabajadorResponse = await request(app)
                .post('/api/trabajador')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    nombres: "Pedro Test",
                    apellidoPaterno: "Otra",
                    apellidoMaterno: "Ficha",
                    rut: "55.555.555-5",
                    fechaNacimiento: "1990-01-01",
                    telefono: "+56912345678",
                    correo: "pedro.ficha@test.com",
                    numeroEmergencia: "+56987654321",
                    direccion: "Av. Test 123",
                    fechaIngreso: "2024-01-01",
                    fichaEmpresa: {
                        cargo: "Analista Test",
                        area: "TI",
                        empresa: "GPS",
                        tipoContrato: "Indefinido",
                        jornadaLaboral: "Completa",
                        sueldoBase: 1000000
                    }
                });

            const otraFichaId = otroTrabajadorResponse.body.data.fichaEmpresa.id;

            const response = await request(app)
                .get(`/api/ficha-empresa/${otraFichaId}/contrato`)
                .set('Authorization', `Bearer ${usuarioToken}`);

            expect(response.status).to.equal(403);
            expect(response.body.status).to.equal("error");
        });
    });

    after(async () => {
        await closeTestApp();
    });
}); 