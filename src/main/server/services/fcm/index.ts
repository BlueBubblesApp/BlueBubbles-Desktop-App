import * as path from "path";
import * as fs from "fs";
import * as firebase from "firebase";
import { FileSystem } from "@server/fileSystem";

export class FCMService {
    app: firebase.app.App;

    constructor() {
        this.app = null;
    }

    start(): Promise<void> {
        if (this.app) return;

        const cfgPath = path.join(FileSystem.fcmDir, "client.json");
        if (!fs.existsSync(cfgPath)) return;
        const cfg = JSON.parse(fs.readFileSync(cfgPath).toString());
        if ((cfg?.client ?? []).length === 0) return;

        const app = cfg.project_info.project_id;
        this.app = firebase.initializeApp({
            apiKey: cfg.client[0].api_key[0].current_key,
            authDomain: `https://${app}.firebaseio.com`,
            databaseURL: cfg.project_info.firebase_url,
            projectId: app,
            storageBucket: cfg.project_info.storage_bucket,
            messagingSenderId: cfg.project_info.project_number,
            appId: cfg.client[0].client_info.mobilesdk_app_id
        });
    }
}
