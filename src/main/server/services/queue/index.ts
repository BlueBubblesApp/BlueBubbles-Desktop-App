import { Server } from "@server/index";
import { ChatRepository } from "@server/databases/chat";

type QueueItem = {
    event: string;
    data: any;
};

export class QueueService {
    stopped = false;

    queue: QueueItem[] = [];

    callback: Function;

    constructor(callback: Function) {
        this.callback = callback;
    }

    async start() {
        while (!this.stopped) {
            const queueCopy = [...this.queue];
            this.queue = [];

            if (queueCopy.length > 0) console.log(`Handling ${queueCopy.length} queued items`);

            for (const i of queueCopy) {
                await this.handleRequest(i);
            }

            // Wait 1 second, then check again
            await new Promise((resolve, _) => setTimeout(resolve, 1000));
        }
    }

    add(event: string, data: any) {
        this.queue.push({ event, data });
    }

    async handleRequest(item: QueueItem) {
        switch (item.event) {
            case "save-message": {
                const msg = ChatRepository.createMessageFromResponse(item.data);
                const newMsg = await Server().chatRepo.saveMessage(msg.chats[0], msg, item.data.tempGuid ?? null);
                this.callback("message", { message: newMsg, tempGuid: item.data.tempGuid });
                break;
            }
            default:
                break;
        }
    }

    stop() {
        this.stopped = true;
    }
}
