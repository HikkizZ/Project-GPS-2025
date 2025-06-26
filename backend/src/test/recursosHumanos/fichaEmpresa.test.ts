// @ts-ignore
import { expect } from 'chai';
// @ts-ignore
import request from 'supertest';
import { app, server, SUPER_ADMIN_CREDENTIALS, RRHH_CREDENTIALS } from '../setup.js';
import { AppDataSource } from '../../config/configDB.js';
import { FichaEmpresa } from '../../entity/recursosHumanos/fichaEmpresa.entity.js';
import { Trabajador } from '../../entity/recursosHumanos/trabajador.entity.js';
import { EstadoLaboral } from '../../entity/recursosHumanos/fichaEmpresa.entity.js';

describe('📋 Ficha Empresa API', () => {
    let adminToken: string = '';
    let rrhToken: string = '';
    let usuarioToken: string = '';
    let fichaId: number;
    let trabajadorId: number;
    let userId: number;
    let token: string = '';

    before(async () => {
        try {
            console.log("✅ Iniciando pruebas de Ficha Empresa");

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

            // Crear trabajador para las pruebas
            const trabajadorResponse = await request(app)
                .post('/api/trabajadores')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    rut: '12.345.678-9',
                    nombres: 'Juan',
                    apellidoPaterno: 'Pérez',
                    apellidoMaterno: 'González',
                    fechaNacimiento: '1990-01-01',
                    nacionalidad: 'Chilena',
                    genero: 'Masculino',
                    estadoCivil: 'Soltero',
                    direccion: 'Calle 123',
                    telefono: '+56912345678',
                    correo: 'juan.perez@test.com',
                    cargo: 'Desarrollador',
                    departamento: 'TI',
                    fechaIngreso: '2023-01-01',
                    sueldoBase: 1000000
                });

            if (!trabajadorResponse.body.trabajador?.id || !trabajadorResponse.body.ficha?.id) {
                console.error('Error: No se pudo obtener el ID de la ficha:', trabajadorResponse.body);
                throw new Error('No se pudieron obtener los IDs necesarios');
            }

            trabajadorId = trabajadorResponse.body.trabajador.id;
            fichaId = trabajadorResponse.body.ficha.id;

            // Registrar usuario
            const userResponse = await request(app)
                .post('/api/auth/register')
                .send({
                    rut: '12.345.678-9',
                    password: 'password123',
                    role: 'Usuario'
                });

            if (!userResponse.body.user?.id) {
                console.error('Error en registro de usuario:', userResponse.body);
                throw new Error('No se pudo registrar el usuario');
            }

            userId = userResponse.body.user.id;

            // Login como usuario
            const userLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    rut: '12.345.678-9',
                    password: 'password123'
                });

            if (!userLogin.body.token) {
                console.error('Error en login de usuario:', userLogin.body);
                throw new Error('No se pudo hacer login');
            }

            token = userLogin.body.token;

        } catch (error) {
            console.error("Error en la configuración de pruebas:", error);
            throw error;
        }
    });

    describe('🔍 Consulta de Fichas', () => {
        it('debe permitir a un trabajador ver su propia ficha', async () => {
            const response = await request(app)
                .get('/api/ficha-empresa/mi-ficha')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data).to.have.property("cargo", "Desarrollador");
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
        it('debe permitir a RRHH cambiar el estado a DESVINCULADO', async () => {
            const response = await request(app)
                .put(`/api/ficha-empresa/${fichaId}/estado`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    estado: EstadoLaboral.DESVINCULADO,
                    motivo: "Término de contrato por bajo rendimiento"
                });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data.estado).to.equal(EstadoLaboral.DESVINCULADO);
        });

        it('no debe permitir a RRHH cambiar manualmente a estado LICENCIA', async () => {
            const response = await request(app)
                .put(`/api/ficha-empresa/${fichaId}/estado`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    estado: EstadoLaboral.LICENCIA,
                    fechaInicio: "2024-03-01",
                    fechaFin: "2024-03-15",
                    motivo: "Licencia médica"
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.message).to.include("RRHH solo puede cambiar el estado a DESVINCULADO");
        });

        it('no debe permitir a RRHH cambiar manualmente a estado PERMISO', async () => {
            const response = await request(app)
                .put(`/api/ficha-empresa/${fichaId}/estado`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    estado: EstadoLaboral.PERMISO,
                    fechaInicio: "2024-03-01",
                    fechaFin: "2024-03-02",
                    motivo: "Permiso administrativo"
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.message).to.include("RRHH solo puede cambiar el estado a DESVINCULADO");
        });

        it('debe requerir motivo para la desvinculación', async () => {
            const response = await request(app)
                .put(`/api/ficha-empresa/${fichaId}/estado`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    estado: EstadoLaboral.DESVINCULADO
                    // Sin motivo
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.message).to.include("motivo es requerido");
        });
    });

    describe('📄 Contratos', () => {
        it('debe permitir descargar contrato al dueño de la ficha', async () => {
            const response = await request(app)
                .get(`/api/ficha-empresa/${fichaId}/contrato`)
                .set('Authorization', `Bearer ${token}`);

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
                        tipoContrato: "Indefinido",
                        jornadaLaboral: "Completa",
                        sueldoBase: 1000000,
                        fechaInicioContrato: "2024-01-01"
                    }
                });

            const otraFichaId = otroTrabajadorResponse.body.data.fichaEmpresa.id;

            const response = await request(app)
                .get(`/api/ficha-empresa/${otraFichaId}/contrato`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).to.equal(403);
            expect(response.body.status).to.equal("error");
        });
    });

    after(async () => {
        try {
            console.log("✅ Pruebas de Ficha Empresa completadas");
        } catch (error) {
            console.error("Error en la limpieza de pruebas:", error);
        }
    });
}); 