import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class Theme {
    @PrimaryColumn("text", { name: "name" })
    name: string;

    @Column("text", { name: "titleBarCloseColor", nullable: true })
    titleBarCloseColor: string;

    @Column("text", { name: "titleBarMinimizeColor", nullable: true })
    titleBarMinimizeColor: string;

    @Column("text", { name: "titleBarMaximizeColor", nullable: true })
    titleBarMaximizeColor: string;

    @Column("text", { name: "searchBackgroundColor", nullable: true })
    searchBackgroundColor: string;

    @Column("text", { name: "searchPlaceholderColor", nullable: true })
    searchPlaceholderColor: string;

    @Column("text", { name: "sidebarColor", nullable: true })
    sidebarColor: string;

    @Column("text", { name: "blueColor", nullable: true })
    blueColor: string;

    @Column("text", { name: "mainTitleColor", nullable: true })
    mainTitleColor: string;

    @Column("text", { name: "subTitleColor", nullable: true })
    subTitleColor: string;

    @Column("text", { name: "secondaryColor", nullable: true })
    secondaryColor: string;

    @Column("text", { name: "backgroundColor", nullable: true })
    backgroundColor: string;

    @Column("text", { name: "rightSidePrimaryColor", nullable: true })
    rightSidePrimaryColor: string;

    @Column("text", { name: "rightSideSecondaryColor", nullable: true })
    rightSideSecondaryColor: string;

    @Column("text", { name: "chatLabelColor", nullable: true })
    chatLabelColor: string;

    @Column("text", { name: "incomingMessageColor", nullable: true })
    incomingMessageColor: string;

    @Column("text", { name: "incomingMessageTextColor", nullable: true })
    incomingMessageTextColor: string;

    @Column("text", { name: "outgoingMessageColor", nullable: true })
    outgoingMessageColor: string;

    @Column("text", { name: "outgoingMessageTextColor", nullable: true })
    outgoingMessageTextColor: string;

    @Column("text", { name: "attachmentButtonColor", nullable: true })
    attachmentButtonColor: string;

    @Column("text", { name: "attachmentClipColor", nullable: true })
    attachmentClipColor: string;

    @Column("text", { name: "sendButtonColor", nullable: true })
    sendButtonColor: string;

    @Column("text", { name: "sendArrowColor", nullable: true })
    sendArrowColor: string;

    @Column("text", { name: "newChatButtonColor", nullable: true })
    newChatButtonColor: string;

    @Column("text", { name: "sidebarBlurredColor", nullable: true })
    sidebarBlurredColor: string;

    @Column("text", { name: "secondaryBlurredColor", nullable: true })
    secondaryBlurredColor: string;
}
