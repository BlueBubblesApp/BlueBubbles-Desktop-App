
import * as io from "socket.io-client";

//Internal Libs
import { FileSystem } from "@server/fileSystem";

//Database Dependency Imports
import { SettingsRepository } from "@server/db/settings";
import { MessagingRepository } from "@server/db/messaging";
import { Connection } from "typeorm";

export class SocketService {
    db: Connection;

    socketServer: any;

    messagingRepo: MessagingRepository;

    settingsRepo: SettingsRepository;

    fs: FileSystem;

    /**
     * Starts up the initial Socket.IO connection and initializes other
     * required classes and variables
     *
     * @param db The configuration database
     * @param iMessageRepo The iMessage database repository
     * @param fs The filesystem class handler
     * @param port The initial port for Socket.IO
     */
    constructor(
        db: Connection,
        messagingRepo: MessagingRepository,
        settingsRepo: SettingsRepository,
        fs: FileSystem,
        ngrokServer: string
    ) {
        this.db = db;

        this.socketServer = io(ngrokServer,{
            query: {
                guid: ""
            }
        });

        this.messagingRepo = messagingRepo;
        this.settingsRepo = settingsRepo;
        this.fs = fs;
    }

    //Inital Socket Connection Handler
    async start() {
    }






}







// import {createConnection, getManager} from "typeorm";
// import {Handle} from "../entities/messaging/Handle";
// import {chatPrevGetAllAction} from "../actions/ChatPrevGetAllAction";

// //Connect to server with socket
// export async function ConnectToServer(url, aGuid){
    
// }

// createConnection({
//     type: "sqlite",
//     database: "src/main/server/db/messaging.db",
//     entities: [
//         Handle
//     ],
//     synchronize: true,
//     logging: false
// }).then(async connection => {
//     const io = require('socket.io-client')
//     const socket = io("",{
//     query: {
//         guid: ""
//     }
//     })

//     // On Socket Connect
//     socket.on('connect', () => {
//     console.log(socket.connected)
//     const firstAppStartUp = true;

//     if (firstAppStartUp){
//         //Get all chats from server and save locally
//         // initFromServer();
//         GetAllChatsFromServer();
//         console.log("here");
//     } else{

//     }
//     });

//     // let handle = new Handle();
//     // handle.address = "";

//     //Get All Chats
//     function GetAllChatsFromServer() {
//         socket.emit('get-chats',true,(data) => {
//         console.log(data.data[0].participants[0].address);
//         await GetHandle();
//         chatPrevGetAllAction();

//         //Get Handle
//         asyncfunction GetHandle() {
//             let handleRepository = connection.getRepository(Handle);
//             let i;
//             for(i=0; i < Object.keys(data.data).length; i++){
//                 let handle = new Handle();
//                 if(data.data[i].participants[0].address != null) {
//                     handle.address = data.data[i].participants[0].address;
//                 };
//                 if(data.data[i].participants[0].country != null) {
//                     handle.country = data.data[i].participants[0].country;
//                 };
//                 if(data.data[i].participants[0].uncanonicalizedId != null) {
//                     handle.uncanonicalizedId = data.data[i].participants[0].uncanonicalizedId;
//                 } else{
//                     handle.uncanonicalizedId = "X:XX PM";
//                 };
//                 // console.log(handle.address);
//                 try {
//                     // return connection.manager
//                     //             .save(handle)
//                     //             .then(handle => {
//                     //                 console.log("handle has been saved. handle address is", handle.address);
//                     //             });
//                     handleRepository.save(handle);
//                     console.log("Handle saved");
//                 } catch (err){
//                     console.log(err);
//                 }
                
//             }
//         }
            

//             return data
//         })
//     }

    

// }).catch(error => console.log("TypeORM connection error: ", error));


// // const initFromServer = {

// // }
    


// //Get A Single Chat by guid
// function GetSingleChat(guid){
//     socket.emit("get-chat",{chatGuid: guid}, (data) =>{
//         console.log(data.data)
//         return data.data
//     })
// }

// //Get All Messages In A Chat
// function GetChatMessages(guid){
//     socket.emit("get-chat-messages",{identifier: guid}, (data) =>{
//         console.log(data.data)
//         return data.data
//     })
// }

// //Get Most Recent Message For A Given guid
// function GetMostRecentMessage(guid){
//     socket.emit("get-last-chat-message",{identifier: guid}, (data) =>{
//         console.log(data)
//         return data
//     })
// }

// //Get Attachment By guid
// function GetAttachmentByGUID(guid){
//     socket.emit("get-attatchment",{identifier: guid}, (data) =>{
//         console.log(data)
//         return data
//     })
// }

// //Get Attachment Chunk By guid
// function GetAttachmentChunkByGUID(guid){
//     socket.emit("get-attatchment-chunk",{identifier: guid}, (data) =>{
//         console.log(data)
//         return data
//     })
// }

// //Get Participants In A Chat
// function GetChatParticipants(guid){
//     socket.emit("get-participants",{identifier: guid}, (data) =>{
//         console.log(data)
//         return data
//     })   
// }

// //Send A Message
// function SendMessage(chatGuid, myMessage) {
//     socket.emit("send-message",{guid: chatGuid, message: myMessage}, (data) =>{
//         console.log(data)
//         return data
//     })  
// }

// //Send A Message With Chunked Attachments
// function SendMessageWithAttachment(guid, myMessage,myAttachmentData){
//     socket.emit("send-message-chunk",{guid: guid, message: myMessage, attachmentData: myAttachmentData}, (data) =>{
//         console.log(data)
//         return data
//     }) 
// }

// //Start A Chat
// function NewChat(guid, chatParticipants){
//     socket.emit("start-chat",{identifier: guid, participants: chatParticipants}, (data) =>{
//         console.log(data)
//         return data
//     }) 
// }

// //Rename A Group Chat
// function RenameGroupChat(guid, newGroupName) {
//     socket.emit("rename-group",{identifier: guid, newName: newGroupName}, (data) =>{
//         console.log(data)
//         return data
//     }) 
// }

// //Add A Participant To Chat
// function AddParticipantToChat(guid, participantAddress){
//     socket.emit("add-participant",{identifier: guid, address: participantAddress}, (data) =>{
//         console.log(data)
//         return data
//     }) 
// }

// //Remove A Participant To Chat
// function RemoveParticipantToChat(guid, participantAddress){
//     socket.emit("remove-participant",{identifier: guid, address: participantAddress}, (data) =>{
//         console.log(data)
//         return data
//     }) 
// }

// //Send Reaction (NOT IMPLEMENTED IN SERVER)
// function SendReaction(guid) {
//     socket.emit("send-reaction",{identifier: guid}, (data) =>{
//         console.log(data)
//     }) 
// }