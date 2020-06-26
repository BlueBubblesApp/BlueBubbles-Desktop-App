import "reflect-metadata";
import { createConnection } from "typeorm";
import { Handle } from "./entities/messaging/Handle";
import { Chat } from "./entities/messaging/Chat";
import { Message } from "./entities/messaging/Message";
import { Attachment } from "./entities/messaging/Attachment";

const express = require("express");

const router = express.Router();

const app = express();
const port = 4000;

app.get("/", (req, res, next) => res.send("Hello World!"));

module.exports = router;

createConnection()
    .then(async connection => {
        console.log("Inserting a new user into the database...");
        const handle = new Handle();
        await connection.manager.save(handle);
    })
    .catch(error => console.log(error));
