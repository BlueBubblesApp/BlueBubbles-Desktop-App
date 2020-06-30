import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity()
@Unique(["address"])
export class Handle {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column("text")
    address: string;

    @Column({ type: "text", nullable: true })
    country: string;

    @Column({ type: "text", nullable: true })
    uncanonicalizedId: string;
}
