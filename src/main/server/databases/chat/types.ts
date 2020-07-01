export type GetMessagesParams = {
    chatGuid?: string;
    offset?: number;
    limit?: number;
    after?: Date | number;
    before?: Date | number;
    withChats?: boolean;
    withAttachments?: boolean;
    withHandle?: boolean;
    sort?: "ASC" | "DESC";
    where?: DBWhereItem[];
};

export type DBWhereItem = {
    statement: string;
    args: { [key: string]: string | number };
};
