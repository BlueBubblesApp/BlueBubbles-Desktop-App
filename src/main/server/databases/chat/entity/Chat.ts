import { Unique, Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { Handle, Message } from "@server/databases/chat/entity";

@Entity("chat")
@Unique(["guid"])
export class Chat {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column({ type: "integer", nullable: true })
    originalROWID: number;

    @Column("text")
    guid: string;

    @Column("integer")
    style: number;

    @Column("text")
    chatIdentifier: string;

    @Column("integer")
    isArchived: number;

    @Column({ type: "text", nullable: true })
    displayName: string;

    @Column({ type: "integer", default: 0 })
    lastViewed: number;

    @ManyToMany(type => Handle, { onDelete: "CASCADE" })
    @JoinTable({
        name: "chat_handle_join",
        joinColumns: [{ name: "chatId" }],
        inverseJoinColumns: [{ name: "handleId" }]
    })
    participants: Handle[];

    @ManyToMany(type => Message, { onDelete: "CASCADE" })
    @JoinTable({
        name: "chat_message_join",
        joinColumns: [{ name: "chatId" }],
        inverseJoinColumns: [{ name: "messageId" }]
    })
    messages: Message[];
}
