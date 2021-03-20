import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, JoinTable, ManyToMany, Unique } from "typeorm";
import { Chat, Message } from "@server/databases/chat/entity";
import * as seedrandom from "seedrandom";

@Entity("handle")
@Unique(["address"])
export class Handle {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column({ type: "integer", nullable: true })
    originalROWID: number;

    @Column("text")
    address: string;

    @Column({ type: "text", nullable: true })
    country: string;

    @Column({ type: "text", nullable: true })
    uncanonicalizedId: string;

    @Column({ type: "text", nullable: true })
    firstName: string;

    @Column({ type: "text", nullable: true })
    lastName: string;

    @Column({ type: "text", nullable: true })
    avatar: string;

    @Column({ type: "text", nullable: true })
    color: string;

    @OneToMany(
        type => Message,
        message => message.handle
    )
    @JoinColumn({ name: "ROWID", referencedColumnName: "handleId" })
    messages: Message[];

    @ManyToMany(type => Chat, { onDelete: "CASCADE" })
    @JoinTable({
        name: "chat_handle_join",
        joinColumns: [{ name: "handleId" }],
        inverseJoinColumns: [{ name: "chatId" }]
    })
    chats: Chat[];
}

export const getGradientIndex = (address): number => {
    const rand = seedrandom(address)();
    if (rand <= 1 / 7) return 1;
    if (rand > 1 / 7 && rand <= 2 / 7) return 2;
    if (rand > 2 / 7 && rand <= 3 / 7) return 3;
    if (rand > 3 / 7 && rand <= 4 / 7) return 4;
    if (rand > 4 / 7 && rand <= 5 / 7) return 5;
    if (rand > 5 / 7 && rand <= 6 / 7) return 6;
    if (rand > 6 / 7 && rand <= 7 / 7) return 7;

    // To use the default color, return null
    return null;
};

export const gradientColorIndexMap = {
    1: {
        bgColor: "#fd678d",
        color: "#861431"
    },
    2: {
        bgColor: "#ff534d",
        color: "#6f120f"
    },
    3: {
        bgColor: "#fea21c",
        color: "#573b11"
    },
    4: {
        bgColor: "#ffca1c",
        color: "#58460c"
    },
    5: {
        bgColor: "#5ede79",
        color: "#105d20"
    },
    6: {
        bgColor: "#6bcff6",
        color: "#094860"
    },
    7: {
        bgColor: "#a78df3",
        color: "#230971"
    },
    8: {
        bgColor: "#686868",
        color: "#861431"
    }
};
