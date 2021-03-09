import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHandleColorColumn1615307901000 implements MigrationInterface {
    // eslint-disable-next-line class-methods-use-this
    async up(queryRunner: QueryRunner): Promise<void> {
        const res = await queryRunner.query(
            `SELECT COUNT(*) AS CNTREC FROM pragma_table_info('handle') WHERE name = 'color';`
        );

        if (res.length === 0 || res[0].CNTREC === 0) {
            await queryRunner.query(`ALTER TABLE handle ADD COLUMN color TEXT DEFAULT NULL;`);
        }
    }

    // eslint-disable-next-line max-len
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function
    async down(queryRunner: QueryRunner): Promise<void> {}
}
