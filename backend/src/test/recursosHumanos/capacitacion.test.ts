import { expect } from 'chai';
import { Application } from 'express';
import request from 'supertest';
import { setupTestApp, closeTestApp } from '../setup.js';
import fs from 'fs';
import path from 'path';

describe('🎓 Capacitación API', () => {
    let app: Application;
    let server: any;
    let adminToken: string;
    let rrhToken: string;
    let usuarioToken: string;
    let trabajadorId: number;
    let capacitacionId: number;

    before(async () => {
        try {
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

            // Buscar si el trabajador ya existe
            console.log('🔄 Buscando trabajador existente...');
            const buscarTrabajadorResponse = await request(app)
                .get('/api/trabajador')
                .set('Authorization', `Bearer ${rrhToken}`)
                .query({ rut: "20.123.456-7" });

            if (buscarTrabajadorResponse.status === 200 && buscarTrabajadorResponse.body.data.length > 0) {
                // El trabajador ya existe, usar el existente
                trabajadorId = buscarTrabajadorResponse.body.data[0].id;
                console.log('✅ Trabajador encontrado con ID:', trabajadorId);
            } else {
                // Crear trabajador de prueba con RUT válido
                console.log('🔄 Creando trabajador para capacitación...');
                const trabajadorResponse = await request(app)
                    .post('/api/trabajador')
                    .set('Authorization', `Bearer ${rrhToken}`)
                    .send({
                        nombres: "Juan Carlos",
                        apellidoPaterno: "Pérez",
                        apellidoMaterno: "González",
                        rut: "20.123.456-7",
                        fechaNacimiento: "1985-05-15",
                        telefono: "+56912345678",
                        correo: "juan.perez.capacitacion@gmail.com", // Email único
                        numeroEmergencia: "+56987654321",
                        direccion: "Av. Las Capacitaciones 123",
                        fechaIngreso: "2024-01-01",
                        fichaEmpresa: {
                            cargo: "Analista de Sistemas",
                            area: "Tecnología",
                            empresa: "GPS",
                            tipoContrato: "Indefinido",
                            jornadaLaboral: "Completa",
                            sueldoBase: 1200000
                        }
                    });

                console.log('📊 Response trabajador:', {
                    status: trabajadorResponse.status,
                    hasData: !!trabajadorResponse.body.data,
                    dataKeys: trabajadorResponse.body.data ? Object.keys(trabajadorResponse.body.data) : [],
                    error: trabajadorResponse.body.message || 'Sin error'
                });

                if (trabajadorResponse.status !== 201 || !trabajadorResponse.body.data) {
                    throw new Error(`No se pudo crear el trabajador: ${trabajadorResponse.body.message || 'Error desconocido'}`);
                }

                trabajadorId = trabajadorResponse.body.data.id;
            }

            // Registrar usuario para el trabajador
            console.log('🔄 Registrando usuario...');
            const registerResponse = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    name: "Juan Carlos Pérez",
                    email: "juan.perez.capacitacion@gmail.com",
                    password: "Juan2024",
                    rut: "20.123.456-7",
                    role: "Usuario"
                });

            console.log('📊 Response register:', {
                status: registerResponse.status,
                message: registerResponse.body.message || 'Sin mensaje'
            });

            if (registerResponse.status !== 201) {
                throw new Error(`No se pudo registrar el usuario: ${registerResponse.body.message || 'Error desconocido'}`);
            }

            // Login como usuario
            console.log('🔄 Login como usuario...');
            const userLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: "juan.perez.capacitacion@gmail.com",
                    password: "Juan2024"
                });

            console.log('📊 Response login:', {
                status: userLogin.status,
                hasToken: !!userLogin.body.data?.token
            });

            if (userLogin.status !== 200 || !userLogin.body.data?.token) {
                throw new Error(`No se pudo hacer login: ${userLogin.body.message || 'Error desconocido'}`);
            }

            usuarioToken = userLogin.body.data.token;
            console.log('✅ Setup de capacitación completado exitosamente');

        } catch (error) {
            console.error('❌ Error en la configuración de pruebas de capacitación:', error);
            throw error;
        }
    });

    describe('📝 Crear Capacitación', () => {
        it('debe permitir a un usuario crear una capacitación para sí mismo', async () => {
            const response = await request(app)
                .post('/api/capacitacion')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    nombreCurso: "Programación en Python Avanzado",
                    institucion: "Instituto Tecnológico Superior",
                    fecha: "2024-01-15",
                    duracion: "40 horas",
                    certificadoURL: "https://ejemplo.com/certificado.pdf"
                });

            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal("success");
            expect(response.body.data).to.have.property("id");
            expect(response.body.data.nombreCurso).to.equal("Programación en Python Avanzado");
            expect(response.body.data.trabajador.rut).to.equal("20.123.456-7");
            
            capacitacionId = response.body.data.id;
        });

        it('debe permitir a RRHH crear capacitación para cualquier trabajador', async () => {
            const response = await request(app)
                .post('/api/capacitacion')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    trabajadorId: trabajadorId,
                    nombreCurso: "Gestión de Proyectos Ágiles",
                    institucion: "Universidad de Capacitación",
                    fecha: "2024-02-10",
                    duracion: "30 horas"
                });

            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal("success");
        });

        it('debe permitir crear capacitación con certificado PDF adjunto', async () => {
            // Crear un archivo PDF de prueba
            const testPdfPath = path.join(process.cwd(), 'test-files', 'certificado.pdf');
            const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n192\n%%EOF';
            
            // Crear directorio si no existe
            const testFilesDir = path.dirname(testPdfPath);
            if (!fs.existsSync(testFilesDir)) {
                fs.mkdirSync(testFilesDir, { recursive: true });
            }
            
            // Escribir archivo de prueba
            fs.writeFileSync(testPdfPath, testPdfContent);

            const response = await request(app)
                .post('/api/capacitacion')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .field('nombreCurso', 'Curso con Certificado PDF')
                .field('institucion', 'Instituto de Pruebas')
                .field('fecha', '2024-03-15')
                .field('duracion', '20 horas')
                .attach('archivo', testPdfPath);

            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal("success");
            expect(response.body.data).to.have.property("certificadoURL");

            // Limpiar archivo de prueba
            if (fs.existsSync(testPdfPath)) {
                fs.unlinkSync(testPdfPath);
            }
        });

        it('debe rechazar capacitación con fecha futura', async () => {
            const fechaFutura = new Date();
            fechaFutura.setFullYear(fechaFutura.getFullYear() + 1);

            const response = await request(app)
                .post('/api/capacitacion')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    nombreCurso: "Curso Futuro",
                    institucion: "Instituto Futuro",
                    fecha: fechaFutura.toISOString().split('T')[0],
                    duracion: "40 horas"
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.message).to.include("futura");
        });

        it('debe validar campos requeridos', async () => {
            const response = await request(app)
                .post('/api/capacitacion')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    nombreCurso: "Curso Incompleto"
                    // Faltan institucion, fecha, duracion
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.data).to.have.property("errors");
        });

        it('debe rechizar archivo no PDF', async () => {
            // Crear un archivo de texto
            const testTextPath = path.join(process.cwd(), 'test-files', 'documento.txt');
            const testFilesDir = path.dirname(testTextPath);
            if (!fs.existsSync(testFilesDir)) {
                fs.mkdirSync(testFilesDir, { recursive: true });
            }
            
            fs.writeFileSync(testTextPath, 'Este es un archivo de texto');

            const response = await request(app)
                .post('/api/capacitacion')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .field('nombreCurso', 'Curso con archivo inválido')
                .field('institucion', 'Instituto de Pruebas')
                .field('fecha', '2024-03-15')
                .field('duracion', '20 horas')
                .attach('archivo', testTextPath);

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.message).to.include("PDF");

            // Limpiar archivo de prueba
            if (fs.existsSync(testTextPath)) {
                fs.unlinkSync(testTextPath);
            }
        });
    });

    describe('📋 Obtener Capacitaciones', () => {
        it('debe permitir a un usuario ver sus propias capacitaciones', async () => {
            const response = await request(app)
                .get('/api/capacitacion')
                .set('Authorization', `Bearer ${usuarioToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data).to.have.property("capacitaciones");
            expect(Array.isArray(response.body.data.capacitaciones)).to.be.true;
        });

        it('debe permitir a RRHH ver todas las capacitaciones', async () => {
            const response = await request(app)
                .get('/api/capacitacion')
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data).to.have.property("capacitaciones");
        });

        it('debe obtener capacitación por ID', async () => {
            if (!capacitacionId) {
                throw new Error('No hay capacitación creada para la prueba');
            }

            const response = await request(app)
                .get(`/api/capacitacion/${capacitacionId}`)
                .set('Authorization', `Bearer ${usuarioToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data.id).to.equal(capacitacionId);
        });

        it('debe obtener capacitaciones de un trabajador específico', async () => {
            const response = await request(app)
                .get(`/api/capacitacion/trabajador/${trabajadorId}`)
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(Array.isArray(response.body.data)).to.be.true;
        });

        it('debe filtrar capacitaciones por institución', async () => {
            const response = await request(app)
                .get('/api/capacitacion?institucion=Tecnológico')
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
        });

        it('debe rechazar acceso a capacitación de otro usuario', async () => {
            // Crear otro trabajador y usuario con RUT válido
            const otroTrabajador = await request(app)
                .post('/api/trabajador')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    nombres: "María",
                    apellidoPaterno: "García",
                    apellidoMaterno: "López",
                    rut: "18.456.789-2", // RUT válido
                    fechaNacimiento: "1990-08-20",
                    telefono: "+56987654321",
                    correo: "maria.garcia@test.com",
                    direccion: "Calle Test 456",
                    fechaIngreso: "2024-01-01",
                    fichaEmpresa: {
                        cargo: "Desarrolladora",
                        area: "TI",
                        empresa: "GPS",
                        tipoContrato: "Indefinido",
                        sueldoBase: 1000000
                    }
                });

            await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    name: "María García",
                    email: "maria.garcia@test.com",
                    password: "Maria2024",
                    rut: "18.456.789-2",
                    role: "Usuario"
                });

            const otroLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: "maria.garcia@test.com",
                    password: "Maria2024"
                });

            const otroToken = otroLogin.body.data.token;

            // Intentar acceder a capacitación de Juan con token de María
            if (!capacitacionId) {
                throw new Error('No hay capacitación creada para la prueba');
            }

            const response = await request(app)
                .get(`/api/capacitacion/${capacitacionId}`)
                .set('Authorization', `Bearer ${otroToken}`);

            expect(response.status).to.equal(403);
            expect(response.body.status).to.equal("error");
        });
    });

    describe('✏️ Actualizar Capacitación', () => {
        it('debe permitir actualizar capacitación propia', async () => {
            if (!capacitacionId) {
                throw new Error('No hay capacitación creada para la prueba');
            }

            const response = await request(app)
                .put(`/api/capacitacion/${capacitacionId}`)
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    nombreCurso: "Programación en Python Avanzado - Actualizado",
                    duracion: "50 horas"
                });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data.nombreCurso).to.include("Actualizado");
        });

        it('debe permitir a RRHH actualizar cualquier capacitación', async () => {
            if (!capacitacionId) {
                throw new Error('No hay capacitación creada para la prueba');
            }

            const response = await request(app)
                .put(`/api/capacitacion/${capacitacionId}`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    institucion: "Instituto Tecnológico Superior - Actualizado"
                });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
        });

        it('debe rechazar fecha futura en actualización', async () => {
            if (!capacitacionId) {
                throw new Error('No hay capacitación creada para la prueba');
            }

            const fechaFutura = new Date();
            fechaFutura.setFullYear(fechaFutura.getFullYear() + 1);

            const response = await request(app)
                .put(`/api/capacitacion/${capacitacionId}`)
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    fecha: fechaFutura.toISOString().split('T')[0]
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
        });
    });

    describe('📥 Descargar Certificado', () => {
        let capacitacionConCertificado: number;

        before(async () => {
            // Crear capacitación con certificado
            const testPdfPath = path.join(process.cwd(), 'test-files', 'cert-download.pdf');
            const testPdfContent = '%PDF-1.4\nTest PDF for download';
            
            const testFilesDir = path.dirname(testPdfPath);
            if (!fs.existsSync(testFilesDir)) {
                fs.mkdirSync(testFilesDir, { recursive: true });
            }
            
            fs.writeFileSync(testPdfPath, testPdfContent);

            const response = await request(app)
                .post('/api/capacitacion')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .field('nombreCurso', 'Curso para Descarga')
                .field('institucion', 'Instituto Download')
                .field('fecha', '2024-03-01')
                .field('duracion', '10 horas')
                .attach('archivo', testPdfPath);

            capacitacionConCertificado = response.body.data.id;

            // Limpiar archivo de prueba
            if (fs.existsSync(testPdfPath)) {
                fs.unlinkSync(testPdfPath);
            }
        });

        it('debe permitir descargar certificado propio', async () => {
            const response = await request(app)
                .get(`/api/capacitacion/${capacitacionConCertificado}/certificado`)
                .set('Authorization', `Bearer ${usuarioToken}`);

            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.equal('application/pdf');
        });

        it('debe permitir a RRHH descargar cualquier certificado', async () => {
            const response = await request(app)
                .get(`/api/capacitacion/${capacitacionConCertificado}/certificado`)
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.equal('application/pdf');
        });

        it('debe manejar capacitación sin certificado', async () => {
            if (!capacitacionId) {
                throw new Error('No hay capacitación creada para la prueba');
            }

            const response = await request(app)
                .get(`/api/capacitacion/${capacitacionId}/certificado`)
                .set('Authorization', `Bearer ${usuarioToken}`);

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.message).to.include("certificado");
        });
    });

    describe('🗑️ Eliminar Capacitación', () => {
        it('debe permitir eliminar capacitación propia', async () => {
            // Crear capacitación para eliminar
            const nuevaCapacitacion = await request(app)
                .post('/api/capacitacion')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    nombreCurso: "Curso Para Eliminar",
                    institucion: "Instituto Test",
                    fecha: "2024-01-01",
                    duracion: "5 horas"
                });

            const response = await request(app)
                .delete(`/api/capacitacion/${nuevaCapacitacion.body.data.id}`)
                .set('Authorization', `Bearer ${usuarioToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
        });

        it('debe permitir a RRHH eliminar cualquier capacitación', async () => {
            // Crear capacitación para eliminar
            const nuevaCapacitacion = await request(app)
                .post('/api/capacitacion')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    nombreCurso: "Curso Para Eliminar RRHH",
                    institucion: "Instituto Test",
                    fecha: "2024-01-01",
                    duracion: "5 horas"
                });

            const response = await request(app)
                .delete(`/api/capacitacion/${nuevaCapacitacion.body.data.id}`)
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
        });

        it('debe rechazar eliminación de capacitación inexistente', async () => {
            const response = await request(app)
                .delete('/api/capacitacion/99999')
                .set('Authorization', `Bearer ${usuarioToken}`);

            expect(response.status).to.equal(404);
            expect(response.body.status).to.equal("error");
        });
    });

    describe('🔒 Autorización y Seguridad', () => {
        it('debe rechazar acceso sin autenticación', async () => {
            const response = await request(app)
                .get('/api/capacitacion');

            expect(response.status).to.equal(401);
        });

        it('debe manejar errores de validación correctamente', async () => {
            const response = await request(app)
                .post('/api/capacitacion')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    nombreCurso: "", // Campo vacío
                    institucion: "Instituto",
                    fecha: "fecha-inválida",
                    duracion: ""
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.data).to.have.property("errors");
        });
    });

    after(async () => {
        // Limpiar archivos de prueba
        const testFilesDir = path.join(process.cwd(), 'test-files');
        if (fs.existsSync(testFilesDir)) {
            fs.rmSync(testFilesDir, { recursive: true, force: true });
        }

        if (server) {
            await closeTestApp();
        }
    });
}); 