import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1740682766603 implements MigrationInterface {
  name = ' $npmConfigName1740682766603';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dev"."documentGeneric" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "route" character varying NOT NULL, "tipo" integer NOT NULL, "extension" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_ef348189c817259de0c18c9c15b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "dev"."personDocument_documenttype_enum" AS ENUM('CEDULA', 'PASAPORTE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "dev"."personDocument" ("id" SERIAL NOT NULL, "documentType" "dev"."personDocument_documenttype_enum" NOT NULL, "documentId" integer, "personId" integer, CONSTRAINT "REL_218ea7afae55b071e339962b21" UNIQUE ("documentId"), CONSTRAINT "PK_1bfd2b6dc8be2654add449f8431" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dev"."person" ("id" SERIAL NOT NULL, "names" character varying NOT NULL, "lastNames" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_5fdaf670315c4b7e70cce85daa3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "dev"."user_role_enum" AS ENUM('admin', 'super-user', 'user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "dev"."user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "dev"."user_role_enum" NOT NULL, "isActive" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, "personId" integer, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "REL_6aac19005cea8e2119cbe7759e" UNIQUE ("personId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dev"."country" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dev"."personAddress" ("id" SERIAL NOT NULL, "address" character varying NOT NULL, "provinceId" integer, CONSTRAINT "PK_26054d85d63cc01187291887586" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dev"."province" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "countryId" integer, CONSTRAINT "PK_4f461cb46f57e806516b7073659" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."personDocument" ADD CONSTRAINT "FK_218ea7afae55b071e339962b217" FOREIGN KEY ("documentId") REFERENCES "dev"."documentGeneric"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."personDocument" ADD CONSTRAINT "FK_230c26ebfc668d3049da48b027e" FOREIGN KEY ("personId") REFERENCES "dev"."person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."user" ADD CONSTRAINT "FK_6aac19005cea8e2119cbe7759e8" FOREIGN KEY ("personId") REFERENCES "dev"."person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."personAddress" ADD CONSTRAINT "FK_c089c8aa6fdfc68b4659bd22268" FOREIGN KEY ("provinceId") REFERENCES "dev"."province"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."province" ADD CONSTRAINT "FK_493e19852e51a27ff8e544fd8cc" FOREIGN KEY ("countryId") REFERENCES "dev"."country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dev"."province" DROP CONSTRAINT "FK_493e19852e51a27ff8e544fd8cc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."personAddress" DROP CONSTRAINT "FK_c089c8aa6fdfc68b4659bd22268"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."user" DROP CONSTRAINT "FK_6aac19005cea8e2119cbe7759e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."personDocument" DROP CONSTRAINT "FK_230c26ebfc668d3049da48b027e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dev"."personDocument" DROP CONSTRAINT "FK_218ea7afae55b071e339962b217"`,
    );
    await queryRunner.query(`DROP TABLE "dev"."province"`);
    await queryRunner.query(`DROP TABLE "dev"."personAddress"`);
    await queryRunner.query(`DROP TABLE "dev"."country"`);
    await queryRunner.query(`DROP TABLE "dev"."user"`);
    await queryRunner.query(`DROP TYPE "dev"."user_role_enum"`);
    await queryRunner.query(`DROP TABLE "dev"."person"`);
    await queryRunner.query(`DROP TABLE "dev"."personDocument"`);
    await queryRunner.query(
      `DROP TYPE "dev"."personDocument_documenttype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "dev"."documentGeneric"`);
  }
}
