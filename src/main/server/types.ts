export type ValidStatuses = 200 | 201 | 400 | 401 | 403 | 404 | 500;

export type Error = {
    type: ErrorTypes;
    message: string;
};

export type ResponseData =
    | MessageResponse
    | HandleResponse
    | ChatResponse
    | AttachmentResponse
    | (MessageResponse | HandleResponse | ChatResponse | AttachmentResponse)[]
    | Uint8Array
    | string
    | null;

export type ResponseFormat = {
    status: ValidStatuses;
    message: ResponseMessages | string;
    error?: Error;
    // Single or list of database objects, or null
    data?: ResponseData;
};

/**
 * ITEM TYPES:
 * 0: Text
 * 1: Removal of person from conversation (groupActionType == 1)
 * 1: Adding of person to conversation (groupActionType == 0)
 * 2: Group Name Change
 * 3: Someone left the conversation (handle_id shows who)
 */
export type MessageResponse = {
    tempGuid?: string;
    guid: string;
    originalROWID: number;
    text: string;
    handle?: HandleResponse | null;
    handleId: number;
    chats?: ChatResponse[];
    attachments?: AttachmentResponse[];
    subject: string;
    country: string;
    error: number;
    dateCreated: number;
    dateRead: number | null;
    dateDelivered: number | null;
    isFromMe: boolean;
    isDelayed: boolean;
    isAutoReply: boolean;
    isSystemMessage: boolean;
    isServiceMessage: boolean;
    isForward: boolean;
    isArchived: boolean;
    cacheRoomnames: string | null;
    isAudioMessage: boolean;
    datePlayed: number | null;
    itemType: number;
    groupTitle: string | null;
    groupActionType: number;
    isExpired: boolean;
    associatedMessageGuid: string | null;
    associatedMessageType: string | null;
    expressiveSendStyleId: string | null;
    timeExpressiveSendStyleId: number | null;
};

export type HandleResponse = {
    originalROWID: number;
    messages?: MessageResponse[];
    chats?: ChatResponse[];
    address: string;
    country: string;
    uncanonicalizedId: string;
    avatar: string; // not sure if this exists?
};

export type ChatResponse = {
    guid: string;
    originalROWID: number;
    participants?: HandleResponse[];
    messages?: MessageResponse[];
    style: number;
    chatIdentifier: string;
    isArchived: boolean;
    displayName: string;
    groupId: string;
};

export type AttachmentResponse = {
    guid: string;
    originalROWID: number;
    messages: string[];
    data: string; // Base64 string
    blurhash: string;
    height?: number;
    width?: number;
    uti: string;
    mimeType: string;
    transferState: number;
    totalBytes: number;
    isOutgoing: boolean;
    transferName: string;
    isSticker: boolean;
    hideAttachment: boolean;
};

export enum ResponseMessages {
    SUCCESS = "Success",
    BAD_REQUEST = "Bad Request",
    SERVER_ERROR = "Server Error",
    UNAUTHORIZED = "Unauthorized",
    FORBIDDEN = "Forbidden",
    NO_DATA = "No Data"
}

export enum ErrorTypes {
    SERVER_ERROR = "Server Error",
    DATABSE_ERROR = "Database Error",
    IMESSAGE_ERROR = "iMessage Error",
    SOCKET_ERROR = "Socket Error",
    VALIDATION_ERROR = "Validation Error"
}

export type ValidTapback = "love" | "like" | "dislike" | "laugh" | "emphasize" | "question";

export type StatusData = {
    newMessage: String;
    newColor?: String;
};

export type SyncStatus = {
    completed?: boolean;
    message?: string;
    error?: boolean;
};
