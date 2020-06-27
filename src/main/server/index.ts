import "reflect-metadata";
import {createConnection} from "typeorm";
import {Handle} from "./entities/messaging/Handle";

createConnection({
    type: "sqlite",
    database: "db/messaging.sqlite",
    entities: [
        Handle
    ],
    synchronize: true,
    logging: false
}).then(connection => {
    // here you can start to work with your entities
}).catch(error => console.log(error));