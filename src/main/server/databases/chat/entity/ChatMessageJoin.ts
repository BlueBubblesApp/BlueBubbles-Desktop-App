import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class ChatMessageJoin {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column("integer")
    chatId: number;

    @Column("integer")
    messageId: number;
}
