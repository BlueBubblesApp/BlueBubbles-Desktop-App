import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm";

@Entity()
export class GeneralSettings {
    @PrimaryColumn("text", { name: "name" })
    name: string;

    @Column("text", { name: "value", nullable: true })
    value: string;
}