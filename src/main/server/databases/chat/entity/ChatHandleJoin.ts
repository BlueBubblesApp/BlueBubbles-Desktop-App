import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class ChatHandleJoin {
    @PrimaryGeneratedColumn("increment")
    ROWID: number;
}
