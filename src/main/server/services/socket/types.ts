export type GetChatsParams = {
    withParticipants?: boolean;
};

export type DBWhereItem = {
    statement: string;
    args: { [key: string]: string | number };
};

export type GetChatMessagesParams = {
    offset?: number;
    limit?: number;
    after?: Date | number;
    before?: Date | number;
    withChats?: boolean;
    withBlurhash?: boolean;
    withHandle?: boolean;
    withAttachments?: boolean;
    where?: DBWhereItem[];
    sort?: "DESC" | "ASC";
};

export type GetAttachmentChunkParams = {
    start?: number;
    chunkSize?: number;
    compress?: boolean;
};
