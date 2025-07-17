// @ts-ignore
import { expect } from 'chai';
// @ts-ignore
import request from 'supertest';
import { app, server, SUPER_ADMIN_CREDENTIALS, RRHH_CREDENTIALS } from '../setup.js';
import { AppDataSource } from '../../config/configDB.js';
import { LicenciaPermiso } from '../../entity/recursosHumanos/licenciaPermiso.entity.js';
import { Trabajador } from '../../entity/recursosHumanos/trabajador.entity.js';
import { EstadoLaboral } from '../../entity/recursosHumanos/fichaEmpresa.entity.js';
import { EstadoSolicitud, TipoSolicitud } from '../../entity/recursosHumanos/licenciaPermiso.entity.js';
import { FichaEmpresa } from '../../entity/recursosHumanos/fichaEmpresa.entity.js';
import path from 'path';
import fs from 'fs';
import { User } from '../../entity/user.entity.js';

describe('📋 Licencias y Permisos API', () => {
    let adminToken: string;
    let rrhToken: string;
    let usuarioToken: string;
    let fichaId: number;
    let trabajadorId: number;
    let licenciaId: number;
    let uniqueEmail: string;

    before(async () => {
        try {
            console.log("✅ Iniciando pruebas de Licencias y Permisos");

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

            const uniqueEmail = `maria.gonzalez.${Date.now()}@gmail.com`;
            
            // Crear trabajador de prueba con RUT válido
            const trabajadorResponse = await request(app)
                .post('/api/trabajador')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    nombres: "María José",
                    apellidoPaterno: "González",
                    apellidoMaterno: "Torres",
                    rut: "28.123.456-0",
                    fechaNacimiento: "1987-03-10",
                    telefono: "+56966666666",
                    correoPersonal: uniqueEmail,
                    numeroEmergencia: "+56977777777",
                    direccion: "Av. Licencias 456",
                    fechaIngreso: "2024-01-01",
                    fichaEmpresa: {
                        cargo: "Coordinadora",
                        area: "Administración",
                        tipoContrato: "Indefinido",
                        jornadaLaboral: "Completa",
                        sueldoBase: 1300000,
                        fechaInicioContrato: "2024-01-01"
                    }
                });

            if (trabajadorResponse.status !== 201 || !trabajadorResponse.body.data?.id) {
                throw new Error(`No se pudo crear trabajador: ${trabajadorResponse.body.message || 'Error desconocido'}`);
            }

            trabajadorId = trabajadorResponse.body.data.id;
            fichaId = trabajadorResponse.body.data.fichaEmpresa.id;

            // Registrar usuario para el trabajador
            const registerResponse = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    name: "María José González",
                    corporateEmail: uniqueEmail,
                    password: "Maria2024",
                    rut: "28.123.456-0",
                    role: "Usuario"
                });

            if (registerResponse.status !== 201) {
                throw new Error(`No se pudo registrar usuario: ${registerResponse.body.message || 'Error desconocido'}`);
            }

            // Login como usuario
            const userLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    corporateEmail: uniqueEmail,
                    password: "Maria2024"
                });

            if (userLogin.status !== 200 || !userLogin.body.data?.token) {
                throw new Error(`No se pudo hacer login: ${userLogin.body.message || 'Error desconocido'}`);
            }

            usuarioToken = userLogin.body.data.token;

        } catch (error) {
            console.error("❌ Error en la configuración de pruebas de licenciaPermiso:", error);
            throw error;
        }
    });

    describe('📝 Solicitud de Licencias y Permisos', () => {
        it('debe permitir a un usuario solicitar una licencia', async () => {
            // Crear archivo PDF de prueba
            const testPdfPath = path.join(process.cwd(), 'test-files', 'licencia.pdf');
            const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n192\n%%EOF';
            
            const testFilesDir = path.dirname(testPdfPath);
            if (!fs.existsSync(testFilesDir)) {
                fs.mkdirSync(testFilesDir, { recursive: true });
            }
            fs.writeFileSync(testPdfPath, testPdfContent);

            const fechaInicio = new Date();
            fechaInicio.setDate(fechaInicio.getDate() + 1);
            const fechaFin = new Date();
            fechaFin.setDate(fechaFin.getDate() + 3);

            const response = await request(app)
                .post('/api/licencia-permiso')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .field('tipo', 'LICENCIA')
                .field('motivo', 'Licencia médica por enfermedad')
                .field('fechaInicio', fechaInicio.toISOString().split('T')[0])
                .field('fechaFin', fechaFin.toISOString().split('T')[0])
                .attach('archivo', testPdfPath);

            // Limpiar archivo
            if (fs.existsSync(testPdfPath)) {
                fs.unlinkSync(testPdfPath);
            }

            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal("success");
            expect(response.body.data).to.have.property("id");
            
            licenciaId = response.body.data.id;
        });

        it('debe validar las fechas de la solicitud', async () => {
            const response = await request(app)
                .post('/api/licencia-permiso')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    tipo: TipoSolicitud.PERMISO,
                    fechaInicio: "2024-03-15",
                    fechaFin: "2024-03-01", // Fecha fin anterior a inicio
                    motivoSolicitud: "Permiso administrativo"
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
        });
    });

    describe('👀 Revisión de Solicitudes', () => {
        it('debe permitir a RRHH aprobar una licencia', async () => {
            const response = await request(app)
                .patch(`/api/licencia-permiso/${licenciaId}/aprobar`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    accion: 'APROBAR',
                    comentarios: 'Licencia aprobada por RRHH'
                });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
        });

        it('debe permitir a RRHH rechazar una solicitud', async () => {
            const solicitudResponse = await request(app)
                .post('/api/licencia-permiso')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    tipo: TipoSolicitud.PERMISO,
                    fechaInicio: "2024-03-15",
                    fechaFin: "2024-03-16",
                    motivoSolicitud: "Permiso administrativo"
                });

            expect(solicitudResponse.status).to.equal(201);
            expect(solicitudResponse.body.status).to.equal("success");

            const response = await request(app)
                .patch(`/api/licencia-permiso/${solicitudResponse.body.data.id}/rechazar`)
                .set('Authorization', `Bearer ${rrhToken}`)
                .send({
                    accion: 'RECHAZAR',
                    comentarios: 'Solicitud rechazada por falta de documentación'
                });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
        });
    });

    describe('🔄 Verificación de Estados', () => {
        it('debe actualizar el estado de las licencias vencidas', async () => {
            const response = await request(app)
                .post('/api/licencia-permiso/verificar-vencimientos')
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
        });

        it('debe mantener el estado de las licencias vigentes', async () => {
            const fechaInicio = new Date();
            fechaInicio.setDate(fechaInicio.getDate() + 1);
            const fechaFin = new Date();
            fechaFin.setDate(fechaFin.getDate() + 3);

            const licenciaVigenteResponse = await request(app)
                .post('/api/licencia-permiso')
                .set('Authorization', `Bearer ${usuarioToken}`)
                .send({
                    tipo: TipoSolicitud.LICENCIA,
                    fechaInicio: fechaInicio.toISOString().split('T')[0],
                    fechaFin: fechaFin.toISOString().split('T')[0],
                    motivoSolicitud: "Licencia médica vigente"
                });

            expect(licenciaVigenteResponse.status).to.equal(201);
            expect(licenciaVigenteResponse.body.status).to.equal("success");

            const response = await request(app)
                .post('/api/licencia-permiso/verificar-vencimientos')
                .set('Authorization', `Bearer ${rrhToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
        });
    });

    after(async () => {
        console.log("✅ Pruebas de Licencias y Permisos completadas");
    });
}); 