export type GetChatsParams = {
    withParticipants?: boolean;
    withSMS?: boolean;
};

export type DBWhereItem = {
    statement: string;
    args: { [key: string]: string | number };
};

export type GetChatMessagesParams = {
    chatGuid?: string;
    offset?: number;
    limit?: number;
    after?: Date | number;
    before?: Date | number;
    withChats?: boolean;
    withBlurhash?: boolean;
    withHandle?: boolean;
    withAttachments?: boolean;
    withSMS?: boolean;
    where?: DBWhereItem[];
    sort?: "DESC" | "ASC";
};

export type GetAttachmentChunkParams = {
    start?: number;
    chunkSize?: number;
    compress?: boolean;
};

export type AttachmentChunkParams = {
    guid: string;
    tempGuid: string;
    message: string;
    attachmentGuid: string;
    attachmentChunkStart: number;
    attachmentName: string;
    hasMore: boolean;
    attachmentData: string;
};
