import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Attachment {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column("text")
    guid: string;

    @Column("text")
    uti: string;

    @Column("text")
    mimeType: string;

    @Column("integer")
    transferState: number;

    @Column("integer")
    isOutgoing: number;

    @Column("integer")
    transferName: number;

    @Column("integer")
    totalBytes: number;

    @Column("integer")
    isSticker: number;

    @Column("integer")
    hideAttachment: number;

    @Column("integer")
    blurhash: number;

    @Column("integer")
    height: number;

    @Column("integer")
    width: number;
}
