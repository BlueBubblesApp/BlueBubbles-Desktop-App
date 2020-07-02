import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinTable, JoinColumn, ManyToMany } from "typeorm";
import { Handle, Chat, Attachment } from "@server/databases/chat/entity/";
import { BooleanTransformer } from "@server/databases/transformers";

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column({ type: "integer", nullable: true })
    handleId: number;

    @Column("text")
    guid: string;

    @Column("text")
    text: string;

    @Column({ type: "text", nullable: true })
    subject: string;

    @Column({ type: "text", nullable: true })
    country: string;

    @Column("integer")
    error: number;

    @Column({ type: "integer", nullable: false })
    dateCreated: number;

    @Column({ type: "integer", nullable: false, default: 0 })
    dateRead: number;

    @Column({ type: "integer", nullable: false, default: 0 })
    dateDelivered: number;

    @Column({ type: "integer", transformer: BooleanTransformer })
    isFromMe: boolean;

    @Column({ type: "integer", transformer: BooleanTransformer })
    isDelayed: boolean;

    @Column({ type: "integer", transformer: BooleanTransformer })
    isAutoReply: boolean;

    @Column({ type: "integer", transformer: BooleanTransformer })
    isSystemMessage: boolean;

    @Column({ type: "integer", transformer: BooleanTransformer })
    isServiceMessage: boolean;

    @Column({ type: "integer", transformer: BooleanTransformer })
    isForward: boolean;

    @Column({ type: "integer", transformer: BooleanTransformer })
    isArchived: boolean;

    @Column({ type: "text", nullable: true })
    cacheRoomnames: string;

    @Column({ type: "integer", transformer: BooleanTransformer, default: false })
    isAudioMessage: boolean;

    @Column("integer")
    datePlayed: number;

    @Column("integer")
    itemType: number;

    @Column({ type: "text", nullable: true })
    groupTitle: string;

    @Column("integer")
    groupActionType: number;

    @Column({ type: "integer", transformer: BooleanTransformer, default: false })
    isExpired: boolean;

    @Column({ type: "text", nullable: true })
    associatedMessageGuid: string;

    @Column({ type: "text", nullable: false, default: 0 })
    associatedMessageType: number;

    @Column({ type: "text", nullable: true })
    expressiveSendStyleId: string;

    @Column({ type: "integer", nullable: false, default: 0 })
    timeExpressiveSendStyleId: number;

    @Column({ type: "integer", transformer: BooleanTransformer, default: false })
    hasAttachments: boolean;

    @ManyToOne(type => Handle)
    @JoinColumn({ name: "handleId", referencedColumnName: "ROWID" })
    handle: Handle | null;

    @ManyToMany(type => Chat, { onDelete: "CASCADE" })
    @JoinTable({ name: "chat_message_join" })
    chats: Chat[];

    @ManyToMany(type => Attachment, { onDelete: "CASCADE" })
    @JoinTable({ name: "attachment_message_join" })
    attachments: Attachment[];
}
