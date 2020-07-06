export type GetChatsParams = {
    withParticipants?: boolean;
};

export type GetChatMessagesParams = {
    offset?: number;
    limit?: number;
    after?: Date | number;
    before?: Date | number;
    withChats?: boolean;
    withBlurhash?: boolean;
    sort?: "DESC" | "ASC";
};

export type GetAttachmentChunkParams = {
    start?: number;
    chunkSize?: number;
    compress?: boolean;
};
