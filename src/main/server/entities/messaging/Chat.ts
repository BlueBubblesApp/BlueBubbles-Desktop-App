import { Entity, PrimaryColumn, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Chat {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column()
    guid: string;

    @Column()
    style: number;

    @Column()
    chatIdentifier: string;

    @Column()
    isArchived: number;

    @Column()
    displayName: string;
}
