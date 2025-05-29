import { expect } from 'chai';
import { Application } from 'express';
import request from 'supertest';
import { setupTestApp, closeTestApp } from '../setup.js';

describe('👥 Trabajadores API', () => {
    let app: Application;
    let server: any;
    let adminToken: string;
    let rrhToken: string;
    const validRut = "33.333.333-3";
    let trabajadorId: number;

    before(async () => {
        try {
            // Configurar el servidor y la base de datos
            const setup = await setupTestApp();
            app = setup.app;
            server = setup.server;

            // Esperar un momento para asegurar que la configuración inicial se complete
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Login como admin
            const adminLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin.principal@gmail.com',
                    password: 'Admin2024'
                });

            if (adminLogin.status !== 200 || !adminLogin.body.data?.token) {
                console.error('Error en login admin:', adminLogin.body);
                throw new Error('No se pudo obtener el token de admin');
            }
            adminToken = adminLogin.body.data.token;

            // Login como RRHH
            const rrhLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'recursoshumanos@gmail.com',
                    password: 'RRHH2024'
                });

            if (rrhLogin.status !== 200 || !rrhLogin.body.data?.token) {
                console.error('Error en login RRHH:', rrhLogin.body);
                throw new Error('No se pudo obtener el token de RRHH');
            }
            rrhToken = rrhLogin.body.data.token;

        } catch (error) {
            console.error('Error en la configuración de pruebas:', error);
            if (server) {
                await closeTestApp();
            }
            throw error;
        }
    });

    describe('✨ Creación de Trabajador', () => {
        it('debe permitir crear un nuevo trabajador con datos válidos', async () => {
            const response = await request(app)
                .post('/api/trabajador')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    nombres: "Juan Carlos",
                    apellidoPaterno: "Pérez",
                    apellidoMaterno: "González",
                    rut: validRut,
                    fechaNacimiento: "1990-01-01",
                    telefono: "+56912345678",
                    correo: "juan.perez@gmail.com",
                    numeroEmergencia: "+56987654321",
                    direccion: "Av. Principal 123",
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

            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal("success");
            expect(response.body.data).to.have.property("id");
            expect(response.body.data.rut).to.equal(validRut);
            trabajadorId = response.body.data.id;
        });

        it('no debe permitir crear un trabajador con RUT inválido', async () => {
            const response = await request(app)
                .post('/api/trabajador')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    nombres: "María",
                    apellidoPaterno: "López",
                    apellidoMaterno: "Silva",
                    rut: "123456789", // RUT inválido
                    fechaNacimiento: "1995-05-15",
                    telefono: "+56912345678",
                    correo: "maria.lopez@gmail.com",
                    numeroEmergencia: "+56987654321",
                    direccion: "Calle Secundaria 456",
                    fechaIngreso: "2024-01-01"
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.message).to.include("RUT");
        });

        it('no debe permitir crear un trabajador con correo duplicado', async () => {
            const response = await request(app)
                .post('/api/trabajador')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    nombres: "Pedro",
                    apellidoPaterno: "Sánchez",
                    apellidoMaterno: "Ramírez",
                    rut: "44.444.444-4",
                    fechaNacimiento: "1992-05-15",
                    telefono: "+56912345678",
                    correo: "juan.perez@gmail.com", // Correo duplicado
                    numeroEmergencia: "+56987654321",
                    direccion: "Calle Nueva 789",
                    fechaIngreso: "2024-01-01",
                    fichaEmpresa: {
                        cargo: "Analista",
                        area: "TI",
                        empresa: "GPS",
                        tipoContrato: "Indefinido",
                        jornadaLaboral: "Completa",
                        sueldoBase: 900000
                    }
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.message.toLowerCase()).to.satisfy((msg: string) => 
                msg.includes('rut') || msg.includes('correo') || msg.includes('duplicado')
            );
        });

        it('no debe permitir crear un trabajador sin datos requeridos', async () => {
            const response = await request(app)
                .post('/api/trabajador')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    nombres: "Pedro",
                    apellidoPaterno: "Sánchez"
                    // Faltan campos requeridos
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
        });
    });

    describe('🔍 Búsqueda de Trabajadores', () => {
        it('debe permitir buscar trabajadores por RUT', async () => {
            const response = await request(app)
                .get('/api/trabajador/detail')
                .set('Authorization', `Bearer ${rrhToken}`)
                .query({ rut: validRut });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data[0].rut).to.equal(validRut);
        });

        it('debe permitir obtener todos los trabajadores', async () => {
            const response = await request(app)
                .get('/api/trabajador/all')
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data).to.be.an('array');
            expect(response.body.data.length).to.be.greaterThan(0);
        });

        it('debe manejar búsquedas sin resultados', async () => {
            const response = await request(app)
                .get('/api/trabajador/detail')
                .set('Authorization', `Bearer ${rrhToken}`)
                .query({ rut: "99.999.999-9" });

            expect(response.status).to.equal(404);
            expect(response.body.status).to.equal("error");
        });
    });

    describe('✏️ Actualización de Trabajador', () => {
        it('debe permitir actualizar datos de un trabajador', async () => {
            const response = await request(app)
                .put(`/api/trabajador/${trabajadorId}`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    telefono: "+56987654321",
                    direccion: "Nueva Dirección 123"
                });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data.telefono).to.equal("+56987654321");
            expect(response.body.data.direccion).to.equal("Nueva Dirección 123");
        });

        it('no debe permitir actualizar campos protegidos', async () => {
            const response = await request(app)
                .put(`/api/trabajador/${trabajadorId}`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    rut: "44.444.444-4",
                    correo: "nuevo@correo.com",
                    fechaIngreso: "2023-01-01"
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.message.toLowerCase()).to.include("no se puede");
        });

        it('debe manejar actualizaciones de trabajadores inexistentes', async () => {
            const response = await request(app)
                .put('/api/trabajador/99999')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    telefono: "+56987654321"
                });

            expect(response.status).to.equal(404);
            expect(response.body.status).to.equal("error");
            expect(response.body.message.toLowerCase()).to.include("no encontrado");
        });
    });

    describe('❌ Eliminación de Trabajador', () => {
        it('debe permitir eliminar un trabajador', async () => {
            const response = await request(app)
                .delete(`/api/trabajador/${trabajadorId}`)
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
        });

        it('debe manejar eliminación de trabajadores inexistentes', async () => {
            const response = await request(app)
                .delete(`/api/trabajador/${trabajadorId}`) // Intentar eliminar el mismo trabajador nuevamente
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(response.status).to.equal(404);
            expect(response.body.status).to.equal("error");
        });
    });

    describe('🔒 Autorización', () => {
        it('no debe permitir acceso sin token', async () => {
            const response = await request(app)
                .get('/api/trabajador/all');

            expect(response.status).to.equal(401);
            expect(response.body.status).to.equal("error");
        });

        it('no debe permitir acceso con token inválido', async () => {
            const response = await request(app)
                .get('/api/trabajador/all')
                .set('Authorization', 'Bearer invalid_token');

            expect(response.status).to.equal(401);
            expect(response.body.status).to.equal("error");
        });
    });

    after(async () => {
        await closeTestApp();
    });
}); 