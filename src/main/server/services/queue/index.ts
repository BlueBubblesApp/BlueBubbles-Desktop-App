import { Server } from "@server/index";
import { ChatRepository } from "@server/databases/chat";

type QueueItem = {
    event: string;
    data: any;
};

export class QueueService {
    isProcessing = false;

    queue: QueueItem[] = [];

    callback: Function;

    isStopped = false;

    constructor(callback: Function) {
        this.callback = callback;
    }

    add(event: string, data: any) {
        // Add the item to the queue, no matter what
        this.queue.push({ event, data });

        // Only process this item if we aren't currently processing
        if (!this.isProcessing) this.processNextItem();
    }

    async processNextItem() {
        // If there are no queued items, we are done processing
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }

        // Start processing top item
        this.isProcessing = true;
        const queued = this.queue.shift();
        console.log(`Processing event, '${queued.event}'`);

        try {
            await this.handleRequest(queued);
        } catch (ex) {
            console.error(`Failed to handle queued item! ${ex.toString()}`);
        }

        // Process the next item
        await this.processNextItem();
    }

    async handleRequest(item: QueueItem) {
        switch (item.event) {
            case "save-message": {
                const msg = ChatRepository.createMessageFromResponse(item.data);
                const newMsg = await Server().chatRepo.saveMessage(msg.chats[0], msg, item.data.tempGuid ?? null);

                if (this.callback) {
                    this.callback("message", { message: newMsg, tempGuid: item.data.tempGuid });
                }

                break;
            }
            default:
                break;
        }
    }
}
