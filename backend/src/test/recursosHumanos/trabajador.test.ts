// @ts-ignore
import { expect } from 'chai';
// @ts-ignore
import request from 'supertest';
import { app, server, SUPER_ADMIN_CREDENTIALS, RRHH_CREDENTIALS } from '../setup.js';
import { AppDataSource } from '../../config/configDB.js';
import { Trabajador } from '../../entity/recursosHumanos/trabajador.entity.js';
import { FichaEmpresa } from '../../entity/recursosHumanos/fichaEmpresa.entity.js';

describe('👥 Pruebas de Trabajadores', () => {
    let adminToken: string;
    let rrhToken: string;
    const uniqueTimestamp = Date.now();
    const validRut = `38.${uniqueTimestamp.toString().slice(-6)}-7`;
    const uniqueEmail = `juan.perez.trabajador.${uniqueTimestamp}@gmail.com`;
    let trabajadorId: number;

    before(async () => {
        try {
            console.log("✅ Iniciando pruebas de Trabajadores");

            // Obtener token de SuperAdmin
            const adminLogin = await request(app)
                .post('/api/auth/login')
                .send(SUPER_ADMIN_CREDENTIALS);

            adminToken = adminLogin.body.data.token;

            // Login como RRHH
            const rrhLogin = await request(app)
                .post('/api/auth/login')
                .send(RRHH_CREDENTIALS);

            if (rrhLogin.status !== 200 || !rrhLogin.body.data?.token) {
                console.error('Error en login RRHH:', rrhLogin.body);
                throw new Error('No se pudo obtener el token de RRHH');
            }
            rrhToken = rrhLogin.body.data.token;

            // Limpiar datos de prueba previos
            const trabajadorPrevio = await request(app)
                .get('/api/trabajadores/rut/12.345.678-9')
                .set('Authorization', `Bearer ${adminToken}`);

            if (trabajadorPrevio.body.data) {
                await request(app)
                    .delete(`/api/trabajadores/${trabajadorPrevio.body.data.id}`)
                    .set('Authorization', `Bearer ${adminToken}`);
            }

        } catch (error) {
            console.error("Error en la configuración de pruebas:", error);
            throw error;
        }
    });

    describe('✨ Creación de Trabajador', () => {
        it('debe permitir crear un nuevo trabajador con datos válidos', async () => {
            // Limpiar trabajador existente si existe
            try {
                const existingWorker = await request(app)
                    .get('/api/trabajador/detail')
                    .set('Authorization', `Bearer ${rrhToken}`)
                    .query({ rut: validRut });
                
                if (existingWorker.status === 200 && existingWorker.body.data && existingWorker.body.data.length > 0) {
                    await request(app)
                        .delete(`/api/trabajador/${existingWorker.body.data[0].id}`)
                        .set('Authorization', `Bearer ${rrhToken}`);
                    console.log('✅ Trabajador existente eliminado');
                }
            } catch (error) {
                console.log('🔄 No hay trabajador previo para limpiar');
            }

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
                    correoPersonal: uniqueEmail,
                    numeroEmergencia: "+56987654321",
                    direccion: "Av. Principal 123",
                    fechaIngreso: "2024-01-01",
                    fichaEmpresa: {
                        cargo: "Desarrollador",
                        area: "TI",
                        tipoContrato: "Indefinido",
                        jornadaLaboral: "Completa",
                        sueldoBase: 800000,
                        fechaInicioContrato: "2025-01-01"
                    }
                });

            console.log('Response status:', response.status);
            console.log('Response body:', response.body);
            
            if (response.status !== 201) {
                console.log('❌ Error en creación de trabajador:', response.body);
                throw new Error(`Creación falló: ${response.body.message}`);
            }
            
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
                    correoPersonal: "maria.lopez@gmail.com",
                    numeroEmergencia: "+56987654321",
                    direccion: "Calle Secundaria 456",
                    fechaIngreso: "2024-01-01"
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.message).to.include("RUT");
        });

        it('no debe permitir crear un trabajador con correo personal duplicado', async () => {
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
                    correoPersonal: uniqueEmail,
                    numeroEmergencia: "+56987654321",
                    direccion: "Calle Nueva 789",
                    fechaIngreso: "2024-01-01",
                    fichaEmpresa: {
                        cargo: "Analista",
                        area: "TI",
                        tipoContrato: "Indefinido",
                        jornadaLaboral: "Completa",
                        sueldoBase: 900000
                    }
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.message.toLowerCase()).to.satisfy((msg: string) => 
                msg.includes('rut') || msg.includes('correoPersonal') || msg.includes('duplicado')
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
                .query({ rut: "98.765.432-1" });

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
                    correoPersonal: "nuevo@correo.com",
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
        try {
            console.log("✅ Pruebas de Trabajadores completadas");
            await request(app)
                .delete(`/api/trabajadores/${trabajadorId}`)
                .set('Authorization', `Bearer ${adminToken}`);
        } catch (error) {
            console.error("Error en la limpieza de pruebas:", error);
        }
    });
}); 