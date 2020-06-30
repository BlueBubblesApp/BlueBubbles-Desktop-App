import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity()
@Unique(["address"])
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
