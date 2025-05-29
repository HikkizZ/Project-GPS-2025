import { expect } from "chai";
import { Application } from "express";
import request from "supertest";
import { setupTestApp, closeTestApp } from "../setup.js";
import { AppDataSource } from "../../config/configDB.js";
import { User } from "../../entity/user.entity.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";

describe("👥 Users API", () => {
    let app: Application;
    let adminToken: string;
    let rrhhToken: string;
    let regularUserToken: string;
    let testTrabajador: Trabajador;

    // Configuración inicial una sola vez para todas las pruebas
    before(async () => {
        const setup = await setupTestApp();
        app = setup.app;

        // Obtener tokens en paralelo
        const [adminLogin, rrhhLogin] = await Promise.all([
            request(app)
                .post("/api/auth/login")
                .send({
                    email: "admin.principal@gmail.com",
                    password: "Admin2024"
                }),
            request(app)
                .post("/api/auth/login")
                .send({
                    email: "recursoshumanos@gmail.com",
                    password: "RRHH2024"
                })
        ]);

        adminToken = adminLogin.body.data.token;
        rrhhToken = rrhhLogin.body.data.token;

        // Crear trabajador y usuario de prueba
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        testTrabajador = trabajadorRepo.create({
            rut: "14.567.890-1",
            nombres: "Usuario Test",
            apellidoPaterno: "Users",
            apellidoMaterno: "API",
            fechaNacimiento: new Date("1990-01-01"),
            telefono: "+56912345678",
            correo: "usuario.test.users@gmail.com",
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
    });

    after(async () => {
        if (testTrabajador) {
            await Promise.all([
                AppDataSource.getRepository(User).delete({ rut: testTrabajador.rut }),
                AppDataSource.getRepository(Trabajador).delete({ rut: testTrabajador.rut })
            ]);
        }
        await closeTestApp();
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
            expect(roleSearch.body.data.some(user => user.role === "Usuario")).to.be.true;
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

    describe("❌ Eliminación de Usuarios", () => {
        let tempUser: any;
        let tempTrabajador: Trabajador;

        beforeEach(async () => {
            // Limpiar cualquier dato residual
            await Promise.all([
                AppDataSource.getRepository(User).delete({ rut: "15.678.901-2" }),
                AppDataSource.getRepository(Trabajador).delete({ rut: "15.678.901-2" })
            ]);

            // Crear trabajador temporal para eliminar
            const trabajadorRepo = AppDataSource.getRepository(Trabajador);
            tempTrabajador = trabajadorRepo.create({
                rut: "15.678.901-2",
                nombres: "Temporal",
                apellidoPaterno: "Test",
                apellidoMaterno: "Delete",
                fechaNacimiento: new Date("1990-01-01"),
                telefono: "+56912345678",
                correo: "temporal.delete@test.com",
                numeroEmergencia: "+56987654321",
                direccion: "Calle Temporal 123",
                fechaIngreso: new Date(),
                enSistema: true
            });

            await trabajadorRepo.save(tempTrabajador);

            // Crear usuario temporal directamente en la base de datos
            const userRepo = AppDataSource.getRepository(User);
            tempUser = userRepo.create({
                name: "Usuario Temporal",
                rut: "15.678.901-2",
                email: "temporal.delete@test.com",
                password: "Temp2024",
                role: "Usuario",
                createAt: new Date(),
                updateAt: new Date()
            });

            await userRepo.save(tempUser);
        });

        it("debe permitir eliminar usuarios a admin", async () => {
            const response = await request(app)
                .delete("/api/user/delete/")
                .query({ rut: "15.678.901-2" })
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal("success");
            expect(response.body.data.rut).to.equal("15.678.901-2");
        });

        it("no debe permitir eliminar usuarios protegidos", async () => {
            const response = await request(app)
                .delete("/api/user/delete/")
                .query({ rut: "11.111.111-1" })
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).to.equal(403);
            expect(response.body.status).to.equal("error");
            expect(response.body.message).to.equal("No se puede eliminar el administrador principal");
        });

        it("debe validar formato de RUT en eliminación", async () => {
            const response = await request(app)
                .delete("/api/user/delete/")
                .query({ rut: "123-invalid" })
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal("error");
            expect(response.body.message).to.equal("Formato de RUT inválido");
        });

        afterEach(async () => {
            // Limpiar datos después de cada prueba
            if (tempUser) {
                await Promise.all([
                    AppDataSource.getRepository(User).delete({ rut: tempUser.rut }),
                    AppDataSource.getRepository(Trabajador).delete({ rut: tempUser.rut })
                ]);
            }
        });
    });
});