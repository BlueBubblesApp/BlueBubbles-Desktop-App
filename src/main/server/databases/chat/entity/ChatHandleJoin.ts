import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class ChatHandleJoin {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column("integer")
    chatId: number;

    @Column("integer")
    handleId: number;
}
