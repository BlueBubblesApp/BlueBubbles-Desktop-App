import "reflect-metadata";
import { ConnectionOptions, createConnection } from "typeorm"
import {Handle} from './main/server/entities/messaging/Handle';

const options: ConnectionOptions = {
  type: "sqlite",
  database: `./data/chatDb.sqlite`,
  entities: [Handle],
  logging: true
}

async function main () {
  const connection = await createConnection(options)
  console.log(connection);
  console.log("done!!!!!");
}

main().catch(console.error)