  
import {Request, Response} from "express";
import {getManager} from "typeorm";
import {Handle} from "../entities/messaging/Handle";
const { ipcMain } = require('electron')

/**
 * LOAD ALL CHAT PREVIEWS FROM DB
 */
export async function chatPrevGetAllAction(request: Request, response: Response) {

    // get a post repository to perform operations with post
    const postRepository = getManager().getRepository(Handle);

    // load a post by a given post id
    const posts = await postRepository.find();

    // return loaded posts
    // response.send(posts);
    // console.log(posts[0].address);

    ipcMain.on('sendChatPrevs', (event, arg) => {
        console.log(arg)
        
        event.returnValue = posts;
      })
}