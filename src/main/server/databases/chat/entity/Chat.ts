import { Unique, Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { Handle, Message } from "@server/databases/chat/entity";

@Entity()
@Unique(["guid"])
export class Chat {
    @PrimaryGeneratedColumn()
    ROWID: number;

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

    @ManyToMany(type => Handle, { onDelete: "CASCADE" })
    @JoinTable({ name: "chat_handle_join" })
    participants: Handle[];

    @ManyToMany(type => Message, { onDelete: "CASCADE" })
    @JoinTable({ name: "chat_message_join" })
    messages: Message[];
}
