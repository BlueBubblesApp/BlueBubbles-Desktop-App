import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity()
@Unique(["guid"])
export class Chat {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column("text")
    guid: string;

    @Column("integer")
    style: number;

    @Column("text")
    chatIdentifier: string;

    @Column("integer")
    isArchived: number;

    @Column({ type: "text", nullable: true })
    displayName: string;
}
