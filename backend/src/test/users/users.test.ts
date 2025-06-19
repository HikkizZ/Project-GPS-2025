// @ts-ignore
import { expect } from 'chai';
// @ts-ignore
import request from 'supertest';
import { app, server } from "../setup.js";
import { AppDataSource } from "../../config/configDB.js";
import { User } from "../../entity/user.entity.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";

describe("👥 Users API", () => {
    let adminToken: string;
    let regularUserToken: string;
    let testTrabajador: Trabajador;

    before(async () => {
        try {
            console.log("✅ Iniciando pruebas de Users");

            // Obtener token de admin
            const adminLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: "admin.principal@gmail.com",
                    password: "204dm1n8"
                });

            adminToken = adminLogin.body.data.token;

            // Crear trabajador y usuario de prueba
            const trabajadorRepo = AppDataSource.getRepository(Trabajador);
            testTrabajador = trabajadorRepo.create({
                rut: "14.567.890-1",
                nombres: "Usuario Test",
                apellidoPaterno: "Users",
                apellidoMaterno: "API",
                fechaNacimiento: new Date("1990-01-01"),
                telefono: "+56912345678",
                correoPersonal: "usuario.test.users@gmail.com",
                numeroEmergencia: "+56987654321",
                direccion: "Calle Test Users 123",
                fechaIngreso: new Date(),
                enSistema: true
            });

            await trabajadorRepo.save(testTrabajador);

            const regularUserResponse = await request(app)
                .post("/api/auth/register")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Usuario Test Users",
                    rut: "14.567.890-1",
                    email: "usuario.test.users@gmail.com",
                    password: "Usuario2024",
                    role: "Usuario"
                });

            const regularLogin = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "usuario.test.users@gmail.com",
                    password: "Usuario2024"
                });
            regularUserToken = regularLogin.body.data.token;
        } catch (error) {
            console.error("Error en la configuración de pruebas:", error);
            throw error;
        }
    });

    after(async () => {
        try {
            console.log("✅ Pruebas de Users completadas");
        } catch (error) {
            console.error("Error en la limpieza de pruebas:", error);
        }
    });

    beforeEach(async () => {
        try {
            // Limpiar usuarios excepto el admin
            await AppDataSource.getRepository(User)
                .createQueryBuilder()
                .delete()
                .where("rut NOT IN (:...ruts)", { 
                    ruts: ['11.111.111-1'] 
                })
                .execute();

            // Limpiar trabajadores excepto el admin
            await AppDataSource.getRepository(Trabajador)
                .createQueryBuilder()
                .delete()
                .where("rut NOT IN (:...ruts)", { 
                    ruts: ['11.111.111-1'] 
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

    describe("🔍 Búsqueda y Filtrado", () => {
        it("debe permitir búsquedas por diferentes criterios", async () => {
            const [emailSearch, rutSearch, roleSearch] = await Promise.all([
                request(app)
                    .get("/api/user/detail/")
                    .query({ email: "usuario.test.users@gmail.com" })
                    .set("Authorization", `Bearer ${adminToken}`),
                request(app)
                    .get("/api/user/detail/")
                    .query({ rut: "14.567.890-1" })
                    .set("Authorization", `Bearer ${adminToken}`),
                request(app)
                    .get("/api/user/detail/")
                    .query({ role: "Usuario" })
                    .set("Authorization", `Bearer ${adminToken}`)
            ]);

            // Verificar búsqueda por email
            expect(emailSearch.status).to.equal(200);
            expect(emailSearch.body.data[0].email).to.equal("usuario.test.users@gmail.com");

            // Verificar búsqueda por RUT
            expect(rutSearch.status).to.equal(200);
            expect(rutSearch.body.data[0].rut).to.equal("14.567.890-1");

            // Verificar búsqueda por rol
            expect(roleSearch.status).to.equal(200);
            expect(roleSearch.body.data.some((user: { role: string }) => user.role === "Usuario")).to.be.true;
        });

        it("debe manejar búsquedas sin resultados correctamente", async () => {
            const response = await request(app)
                .get("/api/user/detail/")
                .query({ email: "noexiste@gmail.com" })
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data).to.be.an("array").that.is.empty;
        });

        it("debe manejar datos malformados correctamente", async () => {
            const [invalidRut, invalidEmail, invalidRole] = await Promise.all([
                request(app)
                    .get("/api/user/detail/")
                    .query({ rut: "123-invalid" })
                    .set("Authorization", `Bearer ${adminToken}`),
                request(app)
                    .get("/api/user/detail/")
                    .query({ email: "not-an-email" })
                    .set("Authorization", `Bearer ${adminToken}`),
                request(app)
                    .get("/api/user/detail/")
                    .query({ role: "RolInvalido" })
                    .set("Authorization", `Bearer ${adminToken}`)
            ]);

            expect(invalidRut.status).to.equal(400);
            expect(invalidRut.body.status).to.equal("error");
            expect(invalidRut.body.message).to.equal("Formato de RUT inválido");
            
            expect(invalidEmail.status).to.equal(400);
            expect(invalidEmail.body.status).to.equal("error");
            expect(invalidEmail.body.message).to.equal("Formato de email inválido");

            expect(invalidRole.status).to.equal(400);
            expect(invalidRole.body.status).to.equal("error");
            expect(invalidRole.body.message).to.equal("Rol inválido");
        });

        it("debe permitir filtros combinados", async () => {
            const response = await request(app)
                .get("/api/user/detail/")
                .query({ 
                    role: "Usuario",
                    email: "usuario.test.users@gmail.com"
                })
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.data).to.be.an("array");
            expect(response.body.data[0].role).to.equal("Usuario");
            expect(response.body.data[0].email).to.equal("usuario.test.users@gmail.com");
        });
    });

    describe("✏️ Actualización de Usuarios", () => {
        it("debe permitir actualizar el rol de un usuario", async () => {
            const response = await request(app)
                .put("/api/user/update/")
                .query({ rut: "14.567.890-1" })
                .send({ role: "RecursosHumanos" })
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data.role).to.equal("RecursosHumanos");

            // Revertir el cambio
            await request(app)
                .put("/api/user/update/")
                .query({ rut: "14.567.890-1" })
                .send({ role: "Usuario" })
                .set("Authorization", `Bearer ${adminToken}`);
        });

        it("debe validar datos en actualización", async () => {
            const [invalidRole, invalidRut] = await Promise.all([
                request(app)
                    .put("/api/user/update/")
                    .query({ rut: "14.567.890-1" })
                    .send({ role: "RolInvalido" })
                    .set("Authorization", `Bearer ${adminToken}`),
                request(app)
                    .put("/api/user/update/")
                    .query({ rut: "123-invalid" })
                    .send({ role: "Usuario" })
                    .set("Authorization", `Bearer ${adminToken}`)
            ]);

            expect(invalidRole.status).to.equal(400);
            expect(invalidRole.body.status).to.equal("error");
            expect(invalidRole.body.message).to.equal("Rol inválido");

            expect(invalidRut.status).to.equal(400);
            expect(invalidRut.body.status).to.equal("error");
            expect(invalidRut.body.message).to.equal("Formato de RUT inválido");
        });

        it("debe manejar actualizaciones de usuarios inexistentes", async () => {
            const response = await request(app)
                .put("/api/user/update/")
                .query({ rut: "99.999.999-9" })
                .send({ role: "Usuario" })
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).to.equal(404);
            expect(response.body.status).to.equal("error");
            expect(response.body.message).to.equal("Usuario no encontrado");
        });

        it("no debe permitir actualizar usuarios protegidos", async () => {
            const response = await request(app)
                .put("/api/user/update/")
                .query({ rut: "11.111.111-1" })
                .send({ role: "Usuario" })
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).to.equal(403);
            expect(response.body.status).to.equal("error");
            expect(response.body.message).to.equal("No se puede modificar el rol del administrador principal");
        });
    });
});