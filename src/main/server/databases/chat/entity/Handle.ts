import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, JoinTable, ManyToMany, Unique } from "typeorm";
import { Chat, Message } from "@server/databases/chat/entity";

@Entity()
@Unique(["address"])
export class Handle {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column("text")
    address: string;

    @Column({ type: "text", nullable: true })
    country: string;

    @Column({ type: "text", nullable: true })
    uncanonicalizedId: string;

    @Column({ type: "text", nullable: true })
    firstName: string;

    @Column({ type: "text", nullable: true })
    lastName: string;

    @Column({ type: "text", nullable: true })
    avatar: string;

    @OneToMany(
        type => Message,
        message => message.handle
    )
    @JoinColumn({ name: "ROWID", referencedColumnName: "handleId" })
    messages: Message[];

    @ManyToMany(type => Chat, { onDelete: "CASCADE" })
    @JoinTable({
        name: "chat_handle_join",
        joinColumns: [{ name: "handleId" }],
        inverseJoinColumns: [{ name: "chatId" }]
    })
    chats: Chat[];
}
