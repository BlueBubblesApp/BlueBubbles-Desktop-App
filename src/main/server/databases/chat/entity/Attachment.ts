import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { Message } from "@server/databases/chat/entity";
import { BooleanTransformer } from "@server/databases/transformers";

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

    @Column("text")
    transferName: string;

    @Column("integer")
    totalBytes: number;

    @Column({ type: "integer", transformer: BooleanTransformer })
    isSticker: boolean;

    @Column({ type: "integer", transformer: BooleanTransformer })
    hideAttachment: boolean;

    @Column("text")
    blurhash: string;

    @Column("integer")
    height: number;

    @Column("integer")
    width: number;

    @ManyToMany(type => Message, { onDelete: "CASCADE" })
    @JoinTable({
        name: "attachment_message_join",
        joinColumns: [{ name: "attachmentId" }],
        inverseJoinColumns: [{ name: "messageId" }]
    })
    messages: Message[];
}
