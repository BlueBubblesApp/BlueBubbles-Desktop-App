import { MigrationInterface, QueryRunner } from "typeorm";
import { tableExists } from "./helpers";

export class AddOriginalRowIDColumn1615324026000 implements MigrationInterface {
    // eslint-disable-next-line class-methods-use-this
    async up(queryRunner: QueryRunner): Promise<void> {
        if (await tableExists(queryRunner, "message")) {
            await queryRunner.query(`ALTER TABLE message ADD COLUMN originalROWID INTEGER DEFAULT NULL;`);
        }

        if (await tableExists(queryRunner, "attachment")) {
            await queryRunner.query(`ALTER TABLE attachment ADD COLUMN originalROWID INTEGER DEFAULT NULL;`);
        }

        if (await tableExists(queryRunner, "chat")) {
            await queryRunner.query(`ALTER TABLE chat ADD COLUMN originalROWID INTEGER DEFAULT NULL;`);
        }

        if (await tableExists(queryRunner, "handle")) {
            await queryRunner.query(`ALTER TABLE handle ADD COLUMN originalROWID INTEGER DEFAULT NULL;`);
        }
    }

    // eslint-disable-next-line max-len
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function
    async down(queryRunner: QueryRunner): Promise<void> {}
}
