import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameCorreoToCorreoPersonal1710000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verifica si la columna correoPersonal ya existe
        const table = await queryRunner.getTable("trabajadores");
        const correoPersonalColumn = table?.findColumnByName("correoPersonal");
        if (!correoPersonalColumn) {
            // Si no existe, la crea
            await queryRunner.query(`ALTER TABLE "trabajadores" ADD COLUMN "correoPersonal" varchar(255) NOT NULL DEFAULT ''`);
        }
        // Elimina el índice antiguo si existe
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_TRABAJADORES_EMAIL"`);
        // Crea el índice único en correoPersonal
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_TRABAJADORES_EMAIL" ON "trabajadores" ("correoPersonal")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Elimina el índice de correoPersonal
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_TRABAJADORES_EMAIL"`);
        // Elimina la columna correoPersonal si existe
        const table = await queryRunner.getTable("trabajadores");
        const correoPersonalColumn = table?.findColumnByName("correoPersonal");
        if (correoPersonalColumn) {
            await queryRunner.query(`ALTER TABLE "trabajadores" DROP COLUMN "correoPersonal"`);
        }
    }
}

// Migración temporal para eliminar el índice único de correoPersonal
export class RemoveUniqueCorreoPersonalIndex1710000009999 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_TRABAJADORES_EMAIL"`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_TRABAJADORES_EMAIL" ON "trabajadores" ("correoPersonal")`);
    }
} 