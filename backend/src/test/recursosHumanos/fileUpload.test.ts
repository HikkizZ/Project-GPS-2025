import { expect } from 'chai';
import { Application } from 'express';
import request from 'supertest';
import { setupTestApp, closeTestApp } from '../setup.js';
import fs from 'fs';
import path from 'path';

describe('📁 File Upload and Download API', () => {
    let app: Application;
    let server: any;
    let rrhToken: string;
    let usuarioToken: string;
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

            // Crear trabajador de prueba con RUT válido
            console.log('🔄 Creando trabajador para fileUpload...');
            const trabajadorResponse = await request(app)
                .post('/api/trabajador')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    nombres: "Carlos",
                    apellidoPaterno: "Mendoza",
                    apellidoMaterno: "Silva",
                    rut: "12.345.678-5", // RUT válido corregido
                    fechaNacimiento: "1985-05-15",
                    telefono: "+56912345678",
                    correo: "carlos.mendoza@gmail.com", // Cambiar dominio
                    numeroEmergencia: "+56987654321",
                    direccion: "Av. Upload 123",
                    fechaIngreso: "2024-01-01",
                    fichaEmpresa: {
                        cargo: "Tester",
                        area: "QA",
                        empresa: "GPS",
                        tipoContrato: "Indefinido",
                        jornadaLaboral: "Completa",
                        sueldoBase: 1100000
                    }
                });

            console.log('📊 Response trabajador fileUpload:', {
                status: trabajadorResponse.status,
                hasData: !!trabajadorResponse.body.data,
                id: trabajadorResponse.body.data?.id,
                message: trabajadorResponse.body.message || 'Sin mensaje'
            });

            if (trabajadorResponse.status !== 201 || !trabajadorResponse.body.data?.id) {
                throw new Error(`No se pudo crear trabajador: ${trabajadorResponse.body.message || 'Error desconocido'}`);
            }

            trabajadorId = trabajadorResponse.body.data.id;
            console.log('✅ Trabajador fileUpload creado con ID:', trabajadorId);

            // Registrar usuario para el trabajador
            console.log('🔄 Registrando usuario fileUpload...');
            const registerResponse = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    name: "Carlos Mendoza",
                    email: "carlos.mendoza@gmail.com", // Cambiar dominio
                    password: "Carlos2024",
                    rut: "12.345.678-5",
                    role: "Usuario"
                });

            console.log('📊 Response register fileUpload:', {
                status: registerResponse.status,
                message: registerResponse.body.message || 'Sin mensaje'
            });

            if (registerResponse.status !== 201) {
                throw new Error(`No se pudo registrar usuario: ${registerResponse.body.message || 'Error desconocido'}`);
            }

            // Login como usuario
            console.log('🔄 Login como usuario fileUpload...');
            const userLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: "carlos.mendoza@gmail.com", // Cambiar dominio
                    password: "Carlos2024"
                });

            console.log('📊 Response login fileUpload:', {
                status: userLogin.status,
                hasToken: !!userLogin.body.data?.token
            });

            if (userLogin.status !== 200 || !userLogin.body.data?.token) {
                throw new Error(`No se pudo hacer login: ${userLogin.body.message || 'Error desconocido'}`);
            }

            usuarioToken = userLogin.body.data.token;
            console.log('✅ Setup de fileUpload completado exitosamente');

        } catch (error) {
            console.error('❌ Error en la configuración de pruebas de fileUpload:', error);
            throw error;
        }
    });

    describe('📤 Subida de Archivos', () => {
        it('debe permitir subir un PDF válido para una licencia médica', async () => {
            // Crear un archivo PDF de prueba
            const testPdfPath = path.join(process.cwd(), 'test-files', 'test.pdf');
            const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n192\n%%EOF';
            
            // Crear directorio si no existe
            const testFilesDir = path.dirname(testPdfPath);
            if (!fs.existsSync(testFilesDir)) {
                fs.mkdirSync(testFilesDir, { recursive: true });
            }
            
            // Escribir archivo de prueba
            fs.writeFileSync(testPdfPath, testPdfContent);

            const fechaInicio = new Date();
            fechaInicio.setDate(fechaInicio.getDate() + 1);
            const fechaFin = new Date();
            fechaFin.setDate(fechaFin.getDate() + 7);

            const response = await request(app)
                .post('/api/licencia-permiso')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .field('tipo', 'LICENCIA')
                .field('fechaInicio', fechaInicio.toISOString().split('T')[0])
                .field('fechaFin', fechaFin.toISOString().split('T')[0])
                .field('motivoSolicitud', 'Licencia médica por gripe')
                .attach('archivo', testPdfPath);

            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal("success");
            expect(response.body.data).to.have.property("id");
            licenciaId = response.body.data.id;

            // Limpiar archivo de prueba
            if (fs.existsSync(testPdfPath)) {
                fs.unlinkSync(testPdfPath);
            }
        });

        it('debe rechazar archivos que no sean PDF', async () => {
            // Crear un archivo de texto
            const testTextPath = path.join(process.cwd(), 'test-files', 'test.txt');
            const testFilesDir = path.dirname(testTextPath);
            if (!fs.existsSync(testFilesDir)) {
                fs.mkdirSync(testFilesDir, { recursive: true });
            }
            
            fs.writeFileSync(testTextPath, 'Este es un archivo de texto');

            const fechaInicio = new Date();
            fechaInicio.setDate(fechaInicio.getDate() + 1);
            const fechaFin = new Date();
            fechaFin.setDate(fechaFin.getDate() + 7);

            const response = await request(app)
                .post('/api/licencia-permiso')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .field('tipo', 'LICENCIA')
                .field('fechaInicio', fechaInicio.toISOString().split('T')[0])
                .field('fechaFin', fechaFin.toISOString().split('T')[0])
                .field('motivoSolicitud', 'Licencia médica por gripe')
                .attach('archivo', testTextPath);

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.message).to.include("PDF");

            // Limpiar archivo de prueba
            if (fs.existsSync(testTextPath)) {
                fs.unlinkSync(testTextPath);
            }
        });

        it('debe requerir archivo para licencias médicas', async () => {
            const fechaInicio = new Date();
            fechaInicio.setDate(fechaInicio.getDate() + 1);
            const fechaFin = new Date();
            fechaFin.setDate(fechaFin.getDate() + 7);

            const response = await request(app)
                .post('/api/licencia-permiso')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .field('tipo', 'LICENCIA')
                .field('fechaInicio', fechaInicio.toISOString().split('T')[0])
                .field('fechaFin', fechaFin.toISOString().split('T')[0])
                .field('motivoSolicitud', 'Licencia médica por gripe');

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.message).to.include("archivo PDF");
        });

        it('debe permitir crear permisos sin archivo adjunto', async () => {
            const fechaInicio = new Date();
            fechaInicio.setDate(fechaInicio.getDate() + 1);
            const fechaFin = new Date();
            fechaFin.setDate(fechaFin.getDate() + 3);

            const response = await request(app)
                .post('/api/licencia-permiso')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .field('tipo', 'PERMISO')
                .field('fechaInicio', fechaInicio.toISOString().split('T')[0])
                .field('fechaFin', fechaFin.toISOString().split('T')[0])
                .field('motivoSolicitud', 'Permiso administrativo para trámites');

            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal("success");
        });
    });

    describe('📥 Descarga de Archivos', () => {
        it('debe permitir al propietario descargar su archivo', async () => {
            if (!licenciaId) {
                throw new Error('No hay licencia creada para la prueba');
            }

            const response = await request(app)
                .get(`/api/licencia-permiso/${licenciaId}/archivo`)
                .set('Authorization', `Bearer ${usuarioToken}`);

            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.equal('application/pdf');
        });

        it('debe permitir a RRHH descargar cualquier archivo', async () => {
            if (!licenciaId) {
                throw new Error('No hay licencia creada para la prueba');
            }

            const response = await request(app)
                .get(`/api/licencia-permiso/${licenciaId}/archivo`)
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.equal('application/pdf');
        });

        it('debe manejar archivos no encontrados', async () => {
            const response = await request(app)
                .get(`/api/licencia-permiso/99999/archivo`)
                .set('Authorization', `Bearer ${usuarioToken}`);

            expect(response.status).to.equal(404);
            expect(response.body.status).to.equal("error");
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