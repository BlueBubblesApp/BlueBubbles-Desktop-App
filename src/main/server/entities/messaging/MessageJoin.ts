import { Entity, PrimaryColumn, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class MessageJoin {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column()
    guid: string;
}
