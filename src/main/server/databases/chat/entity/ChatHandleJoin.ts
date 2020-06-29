import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class ChatHandleJoin {
    @PrimaryGeneratedColumn()
    ROWID: number;
}
