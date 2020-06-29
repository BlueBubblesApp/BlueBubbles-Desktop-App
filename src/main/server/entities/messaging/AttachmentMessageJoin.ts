import { Entity, PrimaryColumn, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class AttachmentJoin {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column()
    guid: string;
}
