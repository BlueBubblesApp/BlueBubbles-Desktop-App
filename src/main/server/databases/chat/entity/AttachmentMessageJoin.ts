import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class AttachmentMessageJoin {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column()
    guid: string;
}
