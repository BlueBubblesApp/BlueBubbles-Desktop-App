import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class ChatMessageJoin {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column("text")
    guid: string;
}
