import request from 'supertest';
import { expect } from 'chai';
import { setupTestServer } from '../server.js';
import { AppDataSource } from '../config/configDB.js';
import { User } from '../entity/user.entity.js';
import { Trabajador } from '../entity/recursosHumanos/trabajador.entity.js';

let app: any;
let adminToken: string;
let rrhhToken: string;

describe("🔒 Auth API - Pruebas de autenticación", () => {
    before(async () => {
        app = await setupTestServer();

        // Limpiar la base de datos
        await AppDataSource.getRepository(User).delete({});
        await AppDataSource.getRepository(Trabajador).delete({});

        // Crear admin inicial
        const adminUser = await AppDataSource.getRepository(User).save({
            name: "Admin Principal",
            rut: "11.111.111-1",
            email: "admin.principal@gmail.com",
            password: "Admin2024",
            role: "Administrador"
        });

        // Crear usuario RRHH
        const rrhhUser = await AppDataSource.getRepository(User).save({
            name: "RRHH Principal",
            rut: "22.222.222-2",
            email: "recursoshumanos@gmail.com",
            password: "RRHH2024",
            role: "RecursosHumanos"
        });

        // Crear trabajador para pruebas
        await AppDataSource.getRepository(Trabajador).save({
            nombre_completo: "Pedro Martinez",
            rut: "11.222.333-4",
            correo_electronico: "pedro.martinez@gmail.com",
            cargo: "Desarrollador"
        });

        // Obtener tokens
        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: "admin.principal@gmail.com",
                password: "Admin2024"
            });
        adminToken = adminLogin.body.data.token;

        const rrhhLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: "recursoshumanos@gmail.com",
                password: "RRHH2024"
            });
        rrhhToken = rrhhLogin.body.data.token;
    });

    beforeEach(async () => {
        // Limpiar usuarios excepto los iniciales antes de cada prueba
        await AppDataSource.getRepository(User)
            .createQueryBuilder()
            .delete()
            .where("email NOT IN (:...emails)", { 
                emails: ['admin.principal@gmail.com', 'recursoshumanos@gmail.com'] 
            })
            .execute();

        // Limpiar trabajadores excepto los iniciales
        await AppDataSource.getRepository(Trabajador)
            .createQueryBuilder()
            .delete()
            .where("rut NOT IN (:...ruts)", {
                ruts: ['11.111.111-1', '22.222.222-2', '11.222.333-4']
            })
            .execute();
    });

    /* Pruebas de register */
    /* Usuario correcto */
    it("🔑 Debe registrar un usuario correctamente", async () =>{
        // Crear trabajador para la prueba
        await AppDataSource.getRepository(Trabajador).save({
            nombre_completo: "Test User",
            rut: "22.675.050-9",
            correo_electronico: "test.user@gmail.com",
            cargo: "Analista"
        });

        const res = await request(app)
            .post("/api/auth/register")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Test User",
                rut: "22.675.050-9",
                email: "test.user@gmail.com",
                password: "testpassword",
                role: "Usuario"
            });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("status").to.equal("success");
        expect(res.body).to.have.property("message").to.equal("Usuario registrado exitosamente.");
    });

    /* Correo o rut ya registrado */
    it("🚫 No debe registrar un usuario con un email ya registrado", async () => {
        // Crear trabajador para la prueba
        await AppDataSource.getRepository(Trabajador).save({
            nombre_completo: "Test User Same Email",
            rut: "22.786.355-2",
            correo_electronico: "test.duplicate@gmail.com",
            cargo: "Analista"
        });

        // Primer registro
        await request(app)
            .post("/api/auth/register")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Test User Same Email",
                rut: "22.786.355-2",
                email: "test.duplicate@gmail.com",
                password: "testpassword",
                role: "Usuario"
            });

        // Intento de registro duplicado
        const res = await request(app)
            .post("/api/auth/register")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Test User Same Email Two",
                rut: "22.786.355-2",
                email: "test.duplicate@gmail.com",
                password: "testpassword",
                role: "Usuario"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El email ingresado ya está registrado.");
    });

    it("🚫 No debe registrar un usuario con un RUT ya registrado", async () => {
        // Crear trabajador para la prueba
        await AppDataSource.getRepository(Trabajador).save({
            nombre_completo: "Test User RUT",
            rut: "22.675.050-9",
            correo_electronico: "test.rut@gmail.com",
            cargo: "Analista"
        });

        // Primer registro
        await request(app)
            .post("/api/auth/register")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Test User RUT",
                rut: "22.675.050-9",
                email: "test.rut@gmail.com",
                password: "testpassword",
                role: "Usuario"
            });

        // Crear segundo trabajador con mismo RUT
        await AppDataSource.getRepository(Trabajador).save({
            nombre_completo: "Test User Same RUT",
            rut: "22.675.050-9",
            correo_electronico: "test.userTwo@gmail.com",
            cargo: "Analista"
        });

        // Intento de registro con RUT duplicado
        const res = await request(app)
            .post("/api/auth/register")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Test User Same RUT",
                rut: "22.675.050-9",
                email: "test.userTwo@gmail.com",
                password: "testpassword",
                role: "Usuario"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El RUT ingresado ya está registrado.");
    });

    /* Rut inválido o email inválido */
    it("🚫 No debe registrar un usuario con un email inválido", async () => {
        // Crear trabajador para la prueba
        await AppDataSource.getRepository(Trabajador).save({
            nombre_completo: "Test User Invalid Email",
            rut: "24.863.526-6",
            correo_electronico: "test.invalidEmail",
            cargo: "Analista"
        });

        const res = await request(app)
            .post("/api/auth/register")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Test User Invalid Email",
                rut: "24.863.526-6",
                email: "test.invalidEmail",
                password: "testpassword",
                role: "Usuario"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El email ingresado no es válido.");
    });

    /* Pruebas con el nombre */

    it("🚫 No debe registrar un usuario con un nombre vacío", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "",
                rut: "22.675.050-9",
                email: "",
                password: "testpassword"
            });
        
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El campo del nombre no puede estar vacío.");
    });

    it("🚫 No debe registrar un usuario con un nombre menor a 3 caracteres", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Te",
                rut: "22.675.050-9",
                email: "",
                password: "testpassword"
            });
        
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El nombre debe tener al menos 3 caracteres.");
    });

    it("🚫 No debe registrar un usuario con un nombre mayor a 70 caracteres", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Maximiliano Alejandro Cristóbal Sebastián Fernando Enrique del Pilar Ramírez Vicuña-Mackenna",
                rut: "22.675.050-9",
                email: "test.maxName@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El nombre debe tener menos de 70 caracteres.");
    });

    it("🚫 No debe registrar un usuario con un nombre que contenga números", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User 123",
                rut: "22.675.050-9",
                email: "test.numberName@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El nombre solo puede contener letras y espacios.");
    });

    it("🚫 No debe registrar un usuario con un nombre que contenga caracteres especiales", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User #131 @$=/()$%",
                rut: "22.675.050-9",
                email: "test.nameSpecial@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El nombre solo puede contener letras y espacios.");
    });

    it("🔤 Al registrarse el nombre solo debe ser de tipo texto", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: 123,
                rut: "22.675.050-9",
                email: "test.textName@gmail.com",
                password: "testpassword"
            });
        
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El nombre debe ser de tipo texto.");
    });

    it("⚠️ Al registrarse el nombre es requerido", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                rut: "22.675.050-9",
                email: "test.withoutName@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El nombre es requerido.");
    });

    /* Pruebas con el rut */
    it("✅ Debe acepetar un rut con formato XX.XXX.XXX-X", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Format Rut One",
                rut: "25.057.638-2",
                email: "test.rutGood@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("status").to.equal("success");
        expect(res.body).to.have.property("message").to.equal("Usuario registrado.");
    });

    it("✅ Debe aceptar un rut con formato XXXXXXXX-X", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Format Rut Two",
                rut: "14408930-8",
                email: "test.rutGood2@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("status").to.equal("success");
        expect(res.body).to.have.property("message").to.equal("Usuario registrado.");
    });

    it("✅ Debe aceptar un rut con formato X.XXX.XXX-X", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Format Rut Three",
                rut: "9.900.332-4",
                email: "email.rutGood3@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("status").to.equal("success");
        expect(res.body).to.have.property("message").to.equal("Usuario registrado.");
    });

    it("✅ Debe aceptar un rut con formato XXXXXXXX-X", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Format Rut Four",
                rut: "9831136-K",
                email: "test.rutGood4@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("status").to.equal("success");
        expect(res.body).to.have.property("message").to.equal("Usuario registrado.");
    });

    it("🔤 Al registrarse el rut debe ser de tipo texto", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Rut",
                rut: 226750509,
                email: "test.rutNumber@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El RUT debe ser de tipo texto.");
    });

    it("🚫 No debe registrar un usuario con un RUT vacío", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Empty Rut",
                rut: "",
                email: "test.rutEmpty@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El campo del RUT no puede estar vacío.");
    });

    it("🚫 No debe registrar un usuario con un RUT inválido", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Invalid Rut",
                rut: "22.675.050-8",
                email: "test.invalidRut@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El RUT ingresado no es válido.");
    });

    it("🚫 No debe registrar un usuario con un RUT que contenga letras", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Letters Rut",
                rut: "22.abc.050-9",
                email: "test.rutWithLetters@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El RUT ingresado no es válido.");
    });

    it("🚫 No debe registrar un usuario con un RUT que contenga caracteres especiales", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Special Characters Rut",
                rut: "22.$%5.050-9",
                email: "test.rutWithSpecial@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El RUT ingresado no es válido.");
    });

    it("🚫 No debe registrar un usuario con un RUT menor a 8 caracteres", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Short Rut",
                rut: "22.67-9",
                email: "rut.min8@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El RUT debe tener al menos 8 caracteres.");
    });

    it("🚫 No debe registrar un usuario con un RUT mayor a 12 caracteres", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Long Rut",
                rut: "22.675.050-9-123",
                email: "test.rut12@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El RUT debe tener menos de 12 caracteres.");
    });

    it("⚠️ Al registrarse el RUT es requerido", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Without Rut",
                email: "test.withoutRut@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El RUT es requerido.");
    });

    /* Pruebas con el email */
    it("🚫 No debe registrar un usuario con un email vacío", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Empty Email",
                rut: "14.532.721-0",
                email: "",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El campo del email no puede estar vacío.");
    });

    it("🚫 No debe registrar un usuario con un email inválido", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Invalid Email",
                rut: "14.532.721-0",
                email: "test.invalidEmail",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El email ingresado no es válido.");
    });

    it("🚫 No debe registrar un usuario con un email menor a 15 caracteres", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Short Email",
                rut: "14.532.721-0",
                email: "test@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El email debe tener al menos 15 caracteres.");
    });

    it("🚫 No debe registrar un usuario con un email mayor a 50 caracteres", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Long Email",
                rut: "14.532.721-0",
                email: "testing.emailMayorALos50MaximosDeCaracteres@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El email debe tener menos de 50 caracteres.");
    });

    it("🔤 Al registrarse el email debe ser de tipo texto", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Email",
                rut: "14.532.721-0",
                email: 123,
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El email debe ser de tipo texto.");
    });

    it("⚠️ Al registrarse el email es requerido", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Without Email",
                rut: "14.532.721-0",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El email es requerido.");
    });

    it("🔑 Debe registrar un usuario con un email con dominio valido", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User gamil",
                rut: "14.532.721-0",
                email: "test.email@gamil.cl",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El dominio del email no es válido.");
    });

    /* Pruebas con la contraseña */
    it("🚫 No debe registrar un usuario con una contraseña vacía", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Empty Password",
                rut: "14.532.721-0",
                email: "test.passwordEmpty@gmail.com",
                password: ""
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El campo de la contraseña no puede estar vacío.");
    });

    it("🚫 No debe registrar un usuario con una contraseña menor a 8 caracteres", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Short Password",
                rut: "14.532.721-0",
                email: "test.passwordMin@gmail.com",
                password: "test"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("La contraseña debe tener al menos 8 caracteres.");
    });

    it("🚫 No debe registrar un usuario con una contraseña mayor a 16 caracteres", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Long Password",
                rut: "14.532.721-0",
                email: "test.passwordMax@gmail.com",
                password: "testpassword123456789"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("La contraseña debe tener menos de 16 caracteres.");
    });

    it("🚫 No debe registrar un usuario con una contraseña que contenga caracteres especiales", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Special Characters Password",
                rut: "14.532.721-0",
                email: "test.passwordSpecial@gmail.com",
                password: "password$%&/()="
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("La contraseña solo puede contener letras y números.");
    });

    it("🔤 Al registrarse la contraseña debe ser de tipo texto", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Password",
                rut: "14.532.721-0",
                email: "test.number@gmail.com",
                password: 123456789
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("La contraseña debe ser de tipo texto.");
    });

    it("⚠️ Al registrarse la contraseña es requerida", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User Without Password",
                rut: "14.532.721-0",
                email: "test.userWithoutPassword@gmail.com",
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("La contraseña es requerida.");
    });

    /* Pruebas de login */
    /* Usuario correcto */
    it("🔑 Debe iniciar sesión correctamente", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test.user@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("status").to.equal("success");
        expect(res.body).to.have.property("message").to.equal("Usuario autenticado.");
        expect(res.body).to.have.property("data");
        expect(res.body.data).to.have.property("token");
    });

    /* Usuario no registrado */
    it("🚫 No debe iniciar sesión con un email no registrado", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test.noEmailRegistered@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(401);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El email ingresado no está registrado.");
    });

    /* Contraseña incorrecta */
    it("🚫 No debe iniciar sesión con una contraseña incorrecta", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test.user@gmail.com",
                password: "testpassword123"
            });

        expect(res.status).to.equal(401);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("La contraseña ingresada es incorrecta.");
    });

    /* Pruebas con el email */
    it("🚫 No debe iniciar sesión con un email vacío", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El campo del email no puede estar vacío.");
    });

    it("🚫 No debe iniciar sesión con un email inválido", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test.invalidEmail",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El email ingresado no es válido.");
    });

    it("🚫 No debe iniciar sesión con un email menor a 15 caracteres", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El email debe tener al menos 15 caracteres.");
    });

    it("🚫 No debe iniciar sesión con un email mayor a 50 caracteres", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "testing.emailMayorALos50MaximosDeCaracteres@gmail.com",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El email debe tener menos de 50 caracteres.");
    });

    it("🔤 Al iniciar sesión el email debe ser de tipo texto", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: 123,
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El email debe ser de tipo texto.");
    });

    it("⚠️ Al iniciar sesión el email es requerido", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El email es requerido.");
    });

    it("🔑 Debe iniciar sesión un email con dominio válido", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test.email@gmail.cl",
                password: "testpassword"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El dominio del email no es válido.");
    });

    /* Pruebas con la contraseña */
    it("🚫 No debe inciar sesión con una contraseña vacía", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test.passwordEmpty@gmail.com",
                password: ""
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("El campo de la contraseña no puede estar vacío.");
    });

    it("🚫 No debe iniciar sesión con una contraseña menor a 8 caracteres", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test.passwordMin@gmail.com",
                password: "test"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("La contraseña debe tener al menos 8 caracteres.");
    });

    it("🚫 No debe iniciar sesión con una contraseña mayor a 16 caracteres", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test.passwordMax@gmail.com",
                password: "testpassword123456789"
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("La contraseña debe tener menos de 16 caracteres.");
    });

    it("🚫 No debe iniciar sesión con una contraseña que contenga caracteres especiales", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                name: "Test User Special Characters Password",
                rut: "14.532.721-0",
                email: "test.passwordSpecial@gmail.com",
                password: "password$%&/()="
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("La contraseña solo puede contener letras y números.");
    });

    it("🔤 Al iniciar sesión la contraseña debe ser de tipo texto", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test.number@gmail.com",
                password: 123456789
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("La contraseña debe ser de tipo texto.");
    });

    it("⚠️ Al iniciar sesión la contraseña es requerida", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test.userWithoutPassword@gmail.com",
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status").to.equal("error");
        expect(res.body).to.have.property("message").to.equal("La contraseña es requerida.");
    });

    /* Nuevas pruebas de validación de roles y trabajador */
    describe("🔐 Validaciones de roles y trabajador", () => {
        it("✅ Admin puede registrar usuario con trabajador existente", async () => {
            const userData = {
                name: "Pedro Martinez",
                rut: "11.222.333-4",
                email: "pedro.martinez@gmail.com",
                password: "Test2024",
                role: "Usuario"
            };

            const res = await request(app)
                .post("/api/auth/register")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(userData);

            expect(res.status).to.equal(201);
            expect(res.body.status).to.equal("success");
            expect(res.body.message).to.equal("Usuario registrado exitosamente.");
        });

        it("✅ RRHH puede registrar usuario con trabajador existente", async () => {
            const userData = {
                name: "Pedro Martinez",
                rut: "11.222.333-4",
                email: "pedro.martinez@gmail.com",
                password: "Test2024",
                role: "Usuario"
            };

            const res = await request(app)
                .post("/api/auth/register")
                .set("Authorization", `Bearer ${rrhhToken}`)
                .send(userData);

            expect(res.status).to.equal(201);
            expect(res.body.status).to.equal("success");
            expect(res.body.message).to.equal("Usuario registrado exitosamente.");
        });

        it("❌ No se puede registrar un usuario sin trabajador existente", async () => {
            const userData = {
                name: "Usuario Sin Trabajador",
                rut: "33.333.333-3",
                email: "noexiste@gmail.com",
                password: "Test2024",
                role: "Usuario"
            };

            const res = await request(app)
                .post("/api/auth/register")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(userData);

            expect(res.status).to.equal(400);
            expect(res.body.status).to.equal("error");
            expect(res.body.message).to.equal("No existe un trabajador con este RUT.");
        });

        it("❌ No se puede registrar un usuario con email diferente al del trabajador", async () => {
            const userData = {
                name: "Pedro Martinez",
                rut: "11.222.333-4",
                email: "email.diferente@gmail.com",
                password: "Test2024",
                role: "Usuario"
            };

            const res = await request(app)
                .post("/api/auth/register")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(userData);

            expect(res.status).to.equal(400);
            expect(res.body.status).to.equal("error");
            expect(res.body.message).to.equal("El email debe coincidir con el email del trabajador.");
        });

        it("❌ No se puede registrar un usuario con rol inválido", async () => {
            const userData = {
                name: "Pedro Martinez",
                rut: "11.222.333-4",
                email: "pedro.martinez@gmail.com",
                password: "Test2024",
                role: "RolInvalido"
            };

            const res = await request(app)
                .post("/api/auth/register")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(userData);

            expect(res.status).to.equal(400);
            expect(res.body.status).to.equal("error");
            expect(res.body.message).to.equal("Rol no válido.");
        });

        it("❌ Usuario normal no puede registrar otros usuarios", async () => {
            // Primero creamos un usuario normal
            const normalUser = await AppDataSource.getRepository(User).save({
                name: "Usuario Normal",
                rut: "44.444.444-4",
                email: "usuario.normal@gmail.com",
                password: "Usuario2024",
                role: "Usuario"
            });

            const loginRes = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "usuario.normal@gmail.com",
                    password: "Usuario2024"
                });

            const normalUserToken = loginRes.body.data.token;

            const userData = {
                name: "Pedro Martinez",
                rut: "11.222.333-4",
                email: "pedro.martinez@gmail.com",
                password: "Test2024",
                role: "Usuario"
            };

            const res = await request(app)
                .post("/api/auth/register")
                .set("Authorization", `Bearer ${normalUserToken}`)
                .send(userData);

            expect(res.status).to.equal(403);
            expect(res.body.status).to.equal("error");
            expect(res.body.message).to.equal("No tienes permisos para realizar esta acción.");
        });
    });

    after(async () => {
        console.log("🔑 Fin de las pruebas de autenticación. Cerrando la base de datos...");
        await AppDataSource.destroy();
    });
})