import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { Message } from "@server/databases/chat/entity";
import { BooleanTransformer } from "@server/databases/transformers";

@Entity("attachment")
export class Attachment {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column({ type: "integer", nullable: true })
    originalROWID: number;

    @Column("text")
    guid: string;

    @Column("text")
    uti: string;

    @Column({ type: "text", nullable: true })
    mimeType: string;

    @Column("integer")
    transferState: number;

    @Column("integer")
    isOutgoing: boolean;

    @Column("text")
    transferName: string;

    @Column("integer")
    totalBytes: number;

    @Column({ type: "integer", transformer: BooleanTransformer })
    isSticker: boolean;

    @Column({ type: "integer", transformer: BooleanTransformer })
    hideAttachment: boolean;

    @Column({ type: "text", nullable: true })
    blurhash: string;

    @Column({ type: "integer", nullable: true })
    height: number;

    @Column({ type: "integer", nullable: true })
    width: number;

    @ManyToMany(type => Message, { onDelete: "CASCADE" })
    @JoinTable({
        name: "attachment_message_join",
        joinColumns: [{ name: "attachmentId" }],
        inverseJoinColumns: [{ name: "messageId" }]
    })
    messages: Message[];
}
