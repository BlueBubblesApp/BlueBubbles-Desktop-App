import { Attachment } from "@server/databases/chat/entity";

export type AttachmentDownload = Attachment & { progress: number; data: string };
