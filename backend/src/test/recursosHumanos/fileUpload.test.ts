// @ts-ignore
import { expect } from 'chai';
// @ts-ignore
import request from 'supertest';
import { app, server, SUPER_ADMIN_CREDENTIALS } from '../setup.js';
import path from 'path';
import fs from 'fs';

describe('📁 File Upload and Download API', () => {
    let adminToken: string;
    const testFilePath = path.join(__dirname, '../resources/test.pdf');

    before(async () => {
        try {
            console.log("✅ Iniciando pruebas de File Upload");

            // Obtener token de SuperAdmin
            const adminLogin = await request(app)
                .post('/api/auth/login')
                .send(SUPER_ADMIN_CREDENTIALS);

            adminToken = adminLogin.body.data.token;

        } catch (error) {
            console.error("❌ Error en la configuración de pruebas de fileUpload:", error);
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
                .set('Authorization', `Bearer ${adminToken}`)
                .field('tipo', 'LICENCIA')
                .field('fechaInicio', fechaInicio.toISOString().split('T')[0])
                .field('fechaFin', fechaFin.toISOString().split('T')[0])
                .field('motivoSolicitud', 'Licencia médica por gripe')
                .attach('archivo', testPdfPath);

            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal("success");
            expect(response.body.data).to.have.property("id");

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
                .set('Authorization', `Bearer ${adminToken}`)
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
                .set('Authorization', `Bearer ${adminToken}`)
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
                .set('Authorization', `Bearer ${adminToken}`)
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
            const response = await request(app)
                .get(`/api/licencia-permiso/${testFilePath}/archivo`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.equal('application/pdf');
        });

        it('debe permitir a RRHH descargar cualquier archivo', async () => {
            const response = await request(app)
                .get(`/api/licencia-permiso/${testFilePath}/archivo`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.equal('application/pdf');
        });

        it('debe manejar archivos no encontrados', async () => {
            const response = await request(app)
                .get(`/api/licencia-permiso/99999/archivo`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).to.equal(404);
            expect(response.body.status).to.equal("error");
        });
    });

    after(async () => {
        try {
            console.log("✅ Pruebas de File Upload completadas");
        } catch (error) {
            console.error("Error en la limpieza de pruebas:", error);
        }
    });
}); 