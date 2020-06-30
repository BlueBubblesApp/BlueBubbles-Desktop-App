import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Attachment {
    @PrimaryGeneratedColumn("increment")
    ROWID: number;

    @Column("text")
    guid: string;

    @Column("text")
    uti: string;

    @Column("text")
    mimeType: string;

    @Column("int")
    transferState: number;

    @Column("int")
    isOutgoing: number;

    @Column("int")
    transferName: number;

    @Column("int")
    totalBytes: number;

    @Column("int")
    isSticker: number;

    @Column("int")
    hideAttachment: number;

    @Column("int")
    blurhash: number;

    @Column("int")
    height: number;

    @Column("int")
    width: number;
}
