import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity()
@Unique(["guid"])
export class Chat {
    @PrimaryGeneratedColumn("increment")
    ROWID: number;

    @Column("text")
    guid: string;

    @Column("int")
    style: number;

    @Column("text")
    chatIdentifier: string;

    @Column("int")
    isArchived: number;

    @Column("text")
    displayName: string;
}
