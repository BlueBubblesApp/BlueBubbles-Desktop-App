import { Entity, PrimaryColumn, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Handle {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column()
    address: string;

    @Column()
    country: string;

    @Column()
    uncanonicalizedId: string;
}
