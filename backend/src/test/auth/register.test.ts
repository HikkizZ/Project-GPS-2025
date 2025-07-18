// @ts-ignore
import { expect } from 'chai';
// @ts-ignore
import request from 'supertest';
import { Application } from 'express';
import { app, server, SUPER_ADMIN_CREDENTIALS, RRHH_CREDENTIALS } from '../setup.js';
import { AppDataSource } from '../../config/configDB.js';
import { User } from '../../entity/user.entity.js';
import { Trabajador } from '../../entity/recursosHumanos/trabajador.entity.js';
import jwt from 'jsonwebtoken';

describe('🔒 Auth API - Registro y Login', () => {
    let adminToken: string;
    let rrhhToken: string;

    before(async () => {
        try {
            console.log("✅ Servidor de pruebas iniciado");

            // Obtener token de SuperAdmin
            const adminLogin = await request(app)
                .post('/api/auth/login')
                .send(SUPER_ADMIN_CREDENTIALS);

            adminToken = adminLogin.body.data.token;

            // Obtener token de RRHH
            const rrhhLogin = await request(app)
                .post('/api/auth/login')
                .send(RRHH_CREDENTIALS);

            rrhhToken = rrhhLogin.body.data.token;

        } catch (error) {
            console.error("❌ Error al iniciar el servidor de pruebas:", error);
            throw error;
        }
    });

    beforeEach(async () => {
        try {
            // Limpiar usuarios excepto los iniciales
            await AppDataSource.getRepository(User)
                .createQueryBuilder()
                .delete()
                .where("rut NOT IN (:...ruts)", { 
                    ruts: ['22.222.222-2'] 
                })
                .execute();

            // Limpiar trabajadores excepto los iniciales
            await AppDataSource.getRepository(Trabajador)
                .createQueryBuilder()
                .delete()
                .where("rut NOT IN (:...ruts)", { 
                    ruts: ['22.222.222-2'] 
                })
                .execute();

            // Crear trabajador de prueba
            const trabajador = {
                nombres: "Usuario",
                apellidoPaterno: "Prueba",
                apellidoMaterno: "Test",
                rut: "12.345.678-9",
                correoPersonal: "usuario.prueba@gmail.com",
                telefono: "+56912345678",
                direccion: "Calle Prueba 123",
                fechaIngreso: new Date(),
                fechaNacimiento: new Date("1990-01-01"),
                numeroEmergencia: "+56987654321",
                enSistema: true
            };

            await AppDataSource.getRepository(Trabajador).save(trabajador);

        } catch (error) {
            console.error("❌ Error en beforeEach:", error);
            throw error;
        }
    });

    afterEach(async () => {
        try {
            // Primero eliminar el usuario de prueba si existe
            await AppDataSource.getRepository(User)
                .createQueryBuilder()
                .delete()
                .where("rut = :rut", { rut: '12.345.678-9' })
                .execute();

            // Luego eliminar el trabajador de prueba
            await AppDataSource.getRepository(Trabajador)
                .createQueryBuilder()
                .delete()
                .where("rut = :rut", { rut: '12.345.678-9' })
                .execute();
        } catch (error) {
            console.error("❌ Error en afterEach:", error);
            throw error;
        }
    });

    after(async () => {
        try {
            // No cerramos la conexión aquí para permitir que otras pruebas la usen
            console.log("🔒 Fin de las pruebas de autenticación.");
        } catch (error) {
            console.error("❌ Error en el cleanup de las pruebas:", error);
        }
    });

    describe('🔑 Login básico', () => {
        beforeEach(async () => {
            // Crear usuario de prueba para login
            const testUser = {
                name: "Test User",
                rut: "33.333.333-3",
                corporateEmail: "test.login@gmail.com",
                password: "TestLogin123",
                role: "Usuario"
            };

            // Crear trabajador de prueba
            const trabajador = {
                nombres: "Test",
                apellidoPaterno: "Login",
                apellidoMaterno: "User",
                rut: "33.333.333-3",
                correoPersonal: "test.login@gmail.com",
                telefono: "+56912345678",
                direccion: "Calle Test 123",
                fechaIngreso: new Date(),
                fechaNacimiento: new Date("1990-01-01"),
                numeroEmergencia: "+56987654321",
                enSistema: true
            };

            await AppDataSource.getRepository(Trabajador).save(trabajador);
            
            // Registrar usuario
            await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(testUser);
        });

        it('debe permitir iniciar sesión con credenciales correctas', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    corporateEmail: "test.login@gmail.com",
                    password: "TestLogin123"
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status').to.equal('success');
            expect(res.body).to.have.property('message').to.equal('Usuario autenticado.');
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.have.property('token');
        });

        it('no debe permitir iniciar sesión con email no registrado', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    corporateEmail: "noexiste@gmail.com",
                    password: "TestLogin123"
                });

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.equal('El correo corporativo ingresado no está registrado.');
        });

        it('no debe permitir iniciar sesión con contraseña incorrecta', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    corporateEmail: "test.login@gmail.com",
                    password: "ContraseñaIncorrecta123"
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.equal('La contraseña debe tener menos de 16 caracteres.');
        });

        it('no debe permitir iniciar sesión con email inválido', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    corporateEmail: "correo.invalido",
                    password: "TestLogin123"
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.include('correo corporativo');
        });

        it('no debe permitir iniciar sesión sin contraseña', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    corporateEmail: "test.login@gmail.com",
                    password: ""
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.include('contraseña');
        });
    });

    describe('Registro con Admin', () => {
        it('debe permitir al admin registrar un nuevo usuario', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: "Usuario Prueba Test",
                    rut: "12.345.678-9",
                    corporateEmail: "usuario.prueba@gmail.com",
                    password: "Usuario123",
                    role: "Usuario"
                });

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('status').to.equal('success');
            expect(res.body).to.have.property('message').to.equal('Usuario registrado exitosamente.');
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.have.property('corporateEmail').to.equal('usuario.prueba@gmail.com');
        });

        it('no debe permitir registrar un usuario sin token', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: "Usuario Prueba Test",
                    rut: "12.345.678-9",
                    corporateEmail: "usuario.prueba@gmail.com",
                    password: "Usuario123",
                    role: "Usuario"
                });

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.equal('Token de autenticación no proporcionado.');
        });

        it('no debe permitir registrar un usuario con RUT no existente en trabajadores', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: "Usuario Prueba Test",
                    rut: "11.222.333-4",
                    corporateEmail: "otro.usuario@gmail.com",
                    password: "Usuario123",
                    role: "Usuario"
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.equal('No existe un trabajador con este RUT.');
        });

        it('no debe permitir registrar un usuario con email diferente al del trabajador', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: "Usuario Prueba Test",
                    rut: "12.345.678-9",
                    corporateEmail: "otro.email@gmail.com",
                    password: "Usuario123",
                    role: "Usuario"
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.equal('El correo corporativo debe coincidir con el correo personal del trabajador.');
        });
    });

    describe('Registro con RRHH', () => {
        it('debe permitir a RRHH registrar un nuevo usuario', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${rrhhToken}`)
                .send({
                    name: "Usuario Prueba Test",
                    rut: "12.345.678-9",
                    corporateEmail: "usuario.prueba@gmail.com",
                    password: "Usuario123",
                    role: "Usuario"
                });

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('status').to.equal('success');
            expect(res.body).to.have.property('message').to.equal('Usuario registrado exitosamente.');
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.have.property('corporateEmail').to.equal('usuario.prueba@gmail.com');
        });

        it('debe permitir a RRHH registrar un usuario administrador', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${rrhhToken}`)
                .send({
                    name: "Admin Prueba",
                    rut: "12.345.678-9",
                    corporateEmail: "usuario.prueba@gmail.com",
                    password: "Usuario123",
                    role: "Administrador"
                });

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('status').to.equal('success');
            expect(res.body).to.have.property('message').to.equal('Usuario registrado exitosamente.');
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.have.property('role').to.equal('Administrador');
        });
    });

    describe('Validaciones de formato', () => {
        it('no debe permitir registrar un usuario con formato de RUT inválido', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: "Usuario Prueba Test",
                    rut: "123456789",  // RUT sin formato
                    corporateEmail: "usuario.prueba@gmail.com",
                    password: "Usuario123",
                    role: "Usuario"
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.include('RUT');
        });

        it('no debe permitir registrar un usuario con formato de email inválido', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: "Usuario Prueba Test",
                    rut: "12.345.678-9",
                    corporateEmail: "correo.invalido@hotmail.com",  // No es gmail.com
                    password: "Usuario123",
                    role: "Usuario"
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.include('correo corporativo');
        });

        it('no debe permitir registrar un usuario con contraseña muy corta', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: "Usuario Prueba Test",
                    rut: "12.345.678-9",
                    corporateEmail: "usuario.prueba@gmail.com",
                    password: "123",  // Contraseña muy corta
                    role: "Usuario"
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.include('contraseña');
        });

        it('no debe permitir registrar un usuario con caracteres especiales en el nombre', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: "Usuario123!@#",  // Caracteres no permitidos
                    rut: "12.345.678-9",
                    corporateEmail: "usuario.prueba@gmail.com",
                    password: "Usuario123",
                    role: "Usuario"
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.include('nombre');
        });
    });

    describe('Validaciones de duplicados', () => {
        beforeEach(async () => {
            // Crear un usuario existente para pruebas
            await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: "Usuario Existente",
                    rut: "12.345.678-9",
                    corporateEmail: "usuario.prueba@gmail.com",
                    password: "Usuario123",
                    role: "Usuario"
                });
        });

        it('no debe permitir registrar un usuario con email ya registrado', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: "Otro Usuario",
                    rut: "12.345.678-9",
                    corporateEmail: "usuario.prueba@gmail.com",  // Email ya registrado
                    password: "Usuario123",
                    role: "Usuario"
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.include('correo corporativo');
            expect(res.body).to.have.property('message').to.include('registrado');
        });
    });

    describe('Validaciones de roles', () => {
        it('no debe permitir registrar un usuario con rol inválido', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: "Usuario Prueba Test",
                    rut: "12.345.678-9",
                    corporateEmail: "usuario.prueba@gmail.com",
                    password: "Usuario123",
                    role: "RolInvalido"  // Rol que no existe
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.equal('Rol no válido.');
        });
    });

    describe('Validaciones de campos requeridos', () => {
        it('no debe permitir registrar un usuario sin nombre', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    rut: "12.345.678-9",
                    corporateEmail: "usuario.prueba@gmail.com",
                    password: "Usuario123",
                    role: "Usuario"
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.include('nombre');
        });

        it('no debe permitir registrar un usuario con campos vacíos', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: "",
                    rut: "12.345.678-9",
                    corporateEmail: "usuario.prueba@gmail.com",
                    password: "Usuario123",
                    role: "Usuario"
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.include('nombre');
        });
    });

    describe('👤 Usuario Administrador Inicial', () => {
        it('debe existir el usuario admin inicial', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    corporateEmail: "super.administrador@lamas.com",
                    password: "204_M1n8"
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status').to.equal('success');
            expect(res.body).to.have.property('message').to.equal('Usuario autenticado.');
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.have.property('token');
        });

        it('debe tener el rol de SuperAdministrador', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    corporateEmail: "super.administrador@lamas.com",
                    password: "204_M1n8"
                });

            const token = res.body.data.token;
            const payload: any = jwt.decode(token);
            expect(payload).to.have.property('role').to.equal('SuperAdministrador');
        });

        it('no debe tener RUT asignado', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    corporateEmail: "super.administrador@lamas.com",
                    password: "204_M1n8"
                });

            const token = res.body.data.token;
            const payload: any = jwt.decode(token);
            expect(payload).to.have.property('rut').to.be.null;
        });
    });

    describe('🚪 Logout', () => {
        it('debe cerrar sesión correctamente', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status').to.equal('success');
            expect(res.body).to.have.property('message').to.equal('Sesión cerrada exitosamente.');
        });

        it('debe limpiar la cookie de sesión', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.headers['set-cookie']).to.exist;
            expect(res.headers['set-cookie'][0]).to.include('jwt=;');
        });
    });

    describe('🔐 Validación de Tokens', () => {
        it('debe rechazar un token expirado', async () => {
            // Crear un token expirado (1 segundo de validez)
            const expiredToken = jwt.sign(
                { id: 1, corporateEmail: 'test@gmail.com', role: 'Usuario' },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '1s' }
            );

            // Esperar 2 segundos para asegurar que expire
            await new Promise(resolve => setTimeout(resolve, 2000));

            const res = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${expiredToken}`)
                .send({
                    name: "Usuario Prueba",
                    rut: "12.345.678-9",
                    corporateEmail: "usuario.prueba@gmail.com",
                    password: "Usuario123",
                    role: "Usuario"
                });

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.equal('invalid signature');
        });

        it('debe rechazar un token malformado', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Authorization', 'Bearer token.malformado.123')
                .send({
                    name: "Usuario Prueba",
                    rut: "12.345.678-9",
                    corporateEmail: "usuario.prueba@gmail.com",
                    password: "Usuario123",
                    role: "Usuario"
                });

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.equal('invalid token');
        });

        it('debe rechazar un token con firma inválida', async () => {
            const tokenConFirmaInvalida = jwt.sign(
                { id: 1, corporateEmail: 'test@gmail.com', role: 'Usuario' },
                'firma_incorrecta'
            );

            const res = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${tokenConFirmaInvalida}`)
                .send({
                    name: "Usuario Prueba",
                    rut: "12.345.678-9",
                    corporateEmail: "usuario.prueba@gmail.com",
                    password: "Usuario123",
                    role: "Usuario"
                });

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.equal('invalid signature');
        });
    });

    describe('🛡️ Seguridad', () => {
        it('debe rechazar intentos de login con credenciales incorrectas', async () => {
            // Intentar login con credenciales incorrectas
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    corporateEmail: "test.login@gmail.com",
                    password: "ContraseñaIncorrecta"
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.equal('La contraseña debe tener menos de 16 caracteres.');
        });

        // TODO: Implementar en el futuro
        // - Sistema de bloqueo por múltiples intentos fallidos
        // - Bloqueo progresivo (15min -> 30min -> 1h)
        // - Desbloqueo manual por admin
        // - Notificaciones por email

        it('debe rechazar contraseñas débiles', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: "Usuario Prueba",
                    rut: "12.345.678-9",
                    corporateEmail: "usuario.prueba@gmail.com",
                    password: "123456",  // Contraseña débil
                    role: "Usuario"
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.equal('La contraseña debe tener al menos 8 caracteres.');
        });

        it('debe sanitizar inputs para prevenir XSS', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: "<script>alert('xss')</script>",
                    rut: "12.345.678-9",
                    corporateEmail: "usuario.prueba@gmail.com",
                    password: "Usuario123",
                    role: "Usuario"
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('status').to.equal('error');
            expect(res.body).to.have.property('message').to.equal('El nombre solo puede contener letras y espacios.');
        });
    });
}); 