export {};

let io = require('socket.io-client');
let socket = io('https://d3eebabcbc0c.ngrok.io',{
    query: {
      guid: 'ceaaeee2-601a-4bcf-975b-8e6ee1bb133f'
    }
});

// On Connect
socket.on('connect', () => {
    console.log(socket.connected)
    console.log("aaaaaaaaaaaa")
    socket.emit('get-chats',true,(data) => {
        console.log(data.data)
        return data.data
    })
});

//Get All Chats
function GetAllChats() {
    socket.emit('get-chats',true,(data) => {
        console.log(data.data)
        return data.data
    })
}

//Get A Single Chat by guid
function GetSingleChat(guid){
    socket.emit("get-chat",{chatGuid: guid}, (data) =>{
        console.log(data.data)
        return data.data
    })
}

//Get All Messages In A Chat
function GetChatMessages(guid){
    socket.emit("get-chat-messages",{identifier: guid}, (data) =>{
        console.log(data.data)
        return data.data
    })
}

//Get Most Recent Message For A Given guid
function GetMostRecentMessage(guid){
    socket.emit("get-last-chat-message",{identifier: guid}, (data) =>{
        console.log(data)
        return data
    })
}

//Get Attachment By guid
function GetAttachmentByGUID(guid){
    socket.emit("get-attatchment",{identifier: guid}, (data) =>{
        console.log(data)
        return data
    })
}

//Get Attachment Chunk By guid
function GetAttachmentChunkByGUID(guid){
    socket.emit("get-attatchment-chunk",{identifier: guid}, (data) =>{
        console.log(data)
        return data
    })
}

//Get Participants In A Chat
function GetChatParticipants(guid){
    socket.emit("get-participants",{identifier: guid}, (data) =>{
        console.log(data)
        return data
    })   
}

//Send A Message
function SendMessage(chatGuid, myMessage) {
    socket.emit("send-message",{guid: chatGuid, message: myMessage}, (data) =>{
        console.log(data)
        return data
    })  
}

//Send A Message With Chunked Attachments
function SendMessageWithAttachment(guid, myMessage,myAttachmentData){
    socket.emit("send-message-chunk",{guid: guid, message: myMessage, attachmentData: myAttachmentData}, (data) =>{
        console.log(data)
        return data
    }) 
}

//Start A Chat
function NewChat(guid, chatParticipants){
    socket.emit("start-chat",{identifier: guid, participants: chatParticipants}, (data) =>{
        console.log(data)
        return data
    }) 
}

//Rename A Group Chat
function RenameGroupChat(guid, newGroupName) {
    socket.emit("rename-group",{identifier: guid, newName: newGroupName}, (data) =>{
        console.log(data)
        return data
    }) 
}

//Add A Participant To Chat
function AddParticipantToChat(guid, participantAddress){
    socket.emit("add-participant",{identifier: guid, address: participantAddress}, (data) =>{
        console.log(data)
        return data
    }) 
}

//Remove A Participant To Chat
function RemoveParticipantToChat(guid, participantAddress){
    socket.emit("remove-participant",{identifier: guid, address: participantAddress}, (data) =>{
        console.log(data)
        return data
    }) 
}

//Send Reaction (NOT IMPLEMENTED IN SERVER)
function SendReaction(guid) {
    socket.emit("send-reaction",{identifier: guid}, (data) =>{
        console.log(data)
    }) 
}