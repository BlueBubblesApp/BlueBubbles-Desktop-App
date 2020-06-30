import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne} from "typeorm";
import { Handle } from "@server/databases/chat/entity/";

@Entity()
export class Message {
    @PrimaryGeneratedColumn("increment")
    ROWID: number;

    @Column("int")
    handleId: number;

    @Column("text")
    guid: string;

    @Column("text")
    text: string;

    @Column("text")
    subject: string;

    @Column("text")
    country: string;

    @Column("int")
    error: number;

    @Column("int")
    dateCreated: number;

    @Column("int")
    dateRead: number;

    @Column("int")
    dateDelivered: number;

    @Column("int")
    isFromMe: number;

    @Column("int")
    isDelayed: number;

    @Column("int")
    isAutoReply: number;

    @Column("int")
    isSystemMessage: number;

    @Column("int")
    isServiceMessage: number;

    @Column("int")
    isForward: number;

    @Column("int")
    isArchived: number;

    @Column("text")
    cacheRoomnames: string;

    @Column("int")
    isAudioMessage: number;

    @Column("int")
    datePlayed: number;

    @Column("int")
    itemType: number;

    @Column("text")
    groupTitle: string;

    @Column("int")
    groupActionType: number;

    @Column("int")
    isExpired: number;

    @Column("text")
    associatedMessageGuid: string;

    @Column("text")
    associatedMessageType: string;

    @Column("text")
    expressiveSendStyleId: string;

    @Column("int")
    timeExpressiveSendStyleId: number;

    @Column("int")
    hasAttachments: number;

    @OneToOne(type => Handle)
    @JoinColumn()
    handle: Handle;
}
