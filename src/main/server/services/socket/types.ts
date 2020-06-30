export type GetChatsParams = {
    withParticipants?: boolean;
};

export type GetChatMessagesParams = {
    offset?: number;
    limit?: number;
    after?: Date | number;
    before?: Date | number;
    withChats?: boolean;
    sort?: "DESC" | "ASC";
};
