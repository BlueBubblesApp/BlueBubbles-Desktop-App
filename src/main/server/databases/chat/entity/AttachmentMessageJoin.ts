import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class AttachmentMessageJoin {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column("integer")
    attachmentId: number;

    @Column("integer")
    messageId: number;
}
