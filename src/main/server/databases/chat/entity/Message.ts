import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    ROWID: number;

    @Column()
    handleId: number;

    @Column()
    guid: string;

    @Column()
    text: string;

    @Column()
    subject: string;

    @Column()
    country: string;

    @Column()
    error: number;

    @Column()
    dateCreated: number;

    @Column()
    dateRead: number;

    @Column()
    dateDelivered: number;

    @Column()
    isFromMe: number;

    @Column()
    isDelayed: number;

    @Column()
    isAutoReply: number;

    @Column()
    isSystemMessage: number;

    @Column()
    isServiceMessage: number;

    @Column()
    isForward: number;

    @Column()
    isArchived: number;

    @Column()
    cacheRoomnames: string;

    @Column()
    isAudioMessage: number;

    @Column()
    datePlayed: number;

    @Column()
    itemType: number;

    @Column()
    groupTitle: string;

    @Column()
    groupActionType: number;

    @Column()
    isExpired: number;

    @Column()
    associatedMessageGuid: string;

    @Column()
    associatedMessageType: string;

    @Column()
    expressiveSendStyleId: string;

    @Column()
    timeExpressiveSendStyleId: number;

    @Column()
    hasAttachments: number;
}
