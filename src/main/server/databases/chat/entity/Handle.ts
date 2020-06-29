import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Handle {
    @PrimaryGeneratedColumn("increment")
    ROWID: number;

    @Column("text")
    address: string;

    @Column("text")
    country: string;

    @Column("text")
    uncanonicalizedId: string;
}
