import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1710000001000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" SERIAL PRIMARY KEY,
                "name" varchar(100) NOT NULL,
                "email" varchar(100) UNIQUE NOT NULL,
                "password" varchar(100) NOT NULL,
                "originalPassword" varchar(100),
                "role" varchar(30) NOT NULL DEFAULT 'Usuario',
                "rut" varchar(20) UNIQUE NOT NULL,
                "estadoCuenta" varchar(50) NOT NULL DEFAULT 'Activa',
                "createAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updateAt" TIMESTAMP NOT NULL DEFAULT now()
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS "users"
        `);
    }
} 