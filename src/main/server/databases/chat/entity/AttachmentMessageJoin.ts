import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class AttachmentMessageJoin {
    @PrimaryGeneratedColumn("increment")
    ROWID: number;

    @Column("text")
    guid: string;
}
