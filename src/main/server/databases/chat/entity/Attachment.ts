import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { Message } from "@server/databases/chat/entity";

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

    @Column("text")
    blurhash: string;

    @Column("integer")
    height: number;

    @Column("integer")
    width: number;

    @ManyToMany(type => Message)
    @JoinTable()
    messages: Message[];
}
