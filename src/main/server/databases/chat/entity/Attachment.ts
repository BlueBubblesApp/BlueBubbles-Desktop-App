import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Attachment {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column()
    guid: string;

    @Column()
    uti: string;

    @Column()
    mimeType: string;

    @Column()
    transferState: number;

    @Column()
    isOutgoing: number;

    @Column()
    transferName: number;

    @Column()
    totalBytes: number;

    @Column()
    isSticker: number;

    @Column()
    hideAttachment: number;

    @Column()
    blurhash: number;

    @Column()
    height: number;

    @Column()
    width: number;
}
