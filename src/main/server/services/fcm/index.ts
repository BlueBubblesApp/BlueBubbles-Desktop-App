import * as path from "path";
import * as fs from "fs";
import * as firebase from "firebase";
import { Server } from "@server/index";
import { FileSystem } from "@server/fileSystem";

const AppName = "BlueBubbles";

export class FCMService {
    static getApp(): firebase.app.App {
        try {
            return firebase.app(AppName);
        } catch (ex) {
            return null;
        }
    }

    static async start(): Promise<void> {
        // If we have already initialized the app, don't re-initialize
        const app = FCMService.getApp();
        if (app) return;

        const cfgPath = path.join(FileSystem.fcmDir, "client.json");
        if (!fs.existsSync(cfgPath)) return;
        const cfg = JSON.parse(fs.readFileSync(cfgPath).toString());
        if ((cfg?.client ?? []).length === 0) return;

        const appId = cfg.project_info.project_id;
        firebase.initializeApp(
            {
                apiKey: cfg.client[0].api_key[0].current_key,
                authDomain: `https://${appId}.firebaseio.com`,
                databaseURL: cfg.project_info.firebase_url,
                projectId: appId,
                storageBucket: cfg.project_info.storage_bucket,
                messagingSenderId: cfg.project_info.project_number,
                appId: cfg.client[0].client_info.mobilesdk_app_id
            },
            AppName
        );

        FCMService.registerListeners();
    }

    static registerListeners() {
        const app = FCMService.getApp();
        if (!app) return;

        // Listen for changes in the database value for the server URL
        app.database()
            .ref("config")
            .on("value", async value => {
                const { serverUrl } = value.val();
                console.log(`Setting new server URL: ${serverUrl}`);

                // If the addresses are the same, don't restart or set the URL
                const currentAddr = Server().configRepo.get("serverAddress") as string;
                if (serverUrl.trim().toLowerCase() === currentAddr.trim().toLowerCase()) return;

                // Save the new server address if it's different
                await Server().configRepo.set("serverAddress", serverUrl);

                // Restart the socket
                console.log(`Restarting socket service...`);
                Server().socketService.dispose();
                await Server().socketService.start();
            });
    }
}
