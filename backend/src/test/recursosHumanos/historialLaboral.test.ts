// @ts-ignore
import { expect } from 'chai';
// @ts-ignore
import request from 'supertest';
import { app, server, SUPER_ADMIN_CREDENTIALS, RRHH_CREDENTIALS } from '../setup.js';
import { AppDataSource } from '../../config/configDB.js';
import { HistorialLaboral } from '../../entity/recursosHumanos/historialLaboral.entity.js';
import { Trabajador } from '../../entity/recursosHumanos/trabajador.entity.js';
import { User } from '../../entity/user.entity.js';

describe('📋 Historial Laboral API', () => {
    let adminToken: string;
    let rrhToken: string;
    let usuarioToken: string;
    let trabajadorId: number;
    let historialId: number;

    before(async () => {
        try {
            console.log("✅ Iniciando pruebas de Historial Laboral");

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

            // Crear trabajador de prueba
            const trabajadorResponse = await request(app)
                .post('/api/trabajador')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    nombres: "Test",
                    apellidoPaterno: "Historial",
                    apellidoMaterno: "Laboral",
                    rut: "35.678.901-6",
                    fechaNacimiento: "1990-01-01",
                    telefono: "+56912345678",
                    correoPersonal: "test.historial.1@gmail.com",
                    numeroEmergencia: "+56987654321",
                    direccion: "Av. Test 123",
                    fechaIngreso: "2024-01-01",
                    fichaEmpresa: {
                        cargo: "Desarrollador",
                        area: "TI",
                        tipoContrato: "Indefinido",
                        jornadaLaboral: "Completa",
                        sueldoBase: 1000000,
                        fechaInicioContrato: "2024-01-01"
                    }
                });

            trabajadorId = trabajadorResponse.body.data.id;

            // Registrar usuario para el trabajador
            const registerResponse = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: "Test Historial",
                    email: "test.historial.1@gmail.com",
                    password: "Test2024",
                    rut: "35.678.901-6",
                    role: "Usuario"
                });

            if (registerResponse.status !== 201) {
                console.error('Error en el registro:', registerResponse.body);
                throw new Error('Fallo en el registro del usuario');
            }

            // Login como el nuevo usuario
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: "test.historial.1@gmail.com",
                    password: "Test2024"
                });

            if (loginResponse.status !== 200) {
                console.error('Error en el login:', loginResponse.body);
                throw new Error('Fallo en el login del usuario');
            }

            usuarioToken = loginResponse.body.data.token;

        } catch (error) {
            console.error("Error en la configuración de pruebas:", error);
            throw error;
        }
    });

    describe('📝 Creación de Historial Laboral', () => {
        it('debe permitir a RRHH crear un nuevo registro de historial', async () => {
            const response = await request(app)
                .post('/api/historial-laboral')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    trabajadorId: trabajadorId,
                    cargo: "Desarrollador Junior",
                    area: "TI",
                    tipoContrato: "Indefinido",
                    sueldoBase: 800000,
                    fechaInicio: "2023-01-01",
                    contratoURL: "https://example.com/contrato.pdf"
                });

            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal("success");
            expect(response.body.data).to.have.property("id");
            historialId = response.body.data.id;
        });

        it('no debe permitir crear un registro si ya existe uno activo', async () => {
            const response = await request(app)
                .post('/api/historial-laboral')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    trabajadorId: trabajadorId,
                    cargo: "Desarrollador Senior",
                    area: "TI",
                    tipoContrato: "Indefinido",
                    sueldoBase: 1200000,
                    fechaInicio: "2024-01-01"
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.message).to.include("registro laboral activo");
        });

        it('no debe permitir a un usuario normal crear registros', async () => {
            const response = await request(app)
                .post('/api/historial-laboral')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    trabajadorId: trabajadorId,
                    cargo: "Hacker",
                    area: "TI",
                    tipoContrato: "Indefinido",
                    sueldoBase: 1000000,
                    fechaInicio: "2024-01-01"
                });

            expect(response.status).to.equal(403);
            expect(response.body.status).to.equal("error");
        });
    });

    describe('🔍 Consulta de Historial Laboral', () => {
        it('debe permitir a RRHH ver el historial de un trabajador', async () => {
            const response = await request(app)
                .get(`/api/historial-laboral/trabajador/${trabajadorId}`)
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data).to.be.an('array');
            expect(response.body.data.length).to.be.greaterThan(0);
        });

        it('debe permitir a un trabajador ver su propio historial', async () => {
            const response = await request(app)
                .get('/api/historial-laboral/mi-historial')
                .set('Authorization', `Bearer ${usuarioToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data).to.be.an('array');
            expect(response.body.data.length).to.be.greaterThan(0);
        });

        it('no debe permitir a un trabajador ver el historial de otros', async () => {
            const response = await request(app)
                .get(`/api/historial-laboral/trabajador/${trabajadorId + 1}`)
                .set('Authorization', `Bearer ${usuarioToken}`);

            expect(response.status).to.equal(403);
            expect(response.body.status).to.equal("error");
        });
    });

    describe('✏️ Actualización de Historial Laboral', () => {
        it('debe permitir a RRHH cerrar un registro de historial', async () => {
            const response = await request(app)
                .put(`/api/historial-laboral/${historialId}`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    fechaFin: "2024-01-01",
                    motivoTermino: "Promoción a nuevo cargo"
                });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data.fechaFin).to.not.be.null;
            expect(response.body.data.motivoTermino).to.equal("Promoción a nuevo cargo");
        });

        it('no debe permitir actualizar un registro ya cerrado', async () => {
            const response = await request(app)
                .put(`/api/historial-laboral/${historialId}`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    fechaFin: "2024-02-01",
                    motivoTermino: "Otro motivo"
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
        });

        it('no debe permitir a un usuario normal actualizar registros', async () => {
            const response = await request(app)
                .put(`/api/historial-laboral/${historialId}`)
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    fechaFin: "2024-01-01",
                    motivoTermino: "Intento no autorizado"
                });

            expect(response.status).to.equal(403);
            expect(response.body.status).to.equal("error");
        });
    });

    after(async () => {
        try {
            console.log("✅ Pruebas de Historial Laboral completadas");
        } catch (error) {
            console.error("Error en la limpieza de pruebas:", error);
        }
    });
});