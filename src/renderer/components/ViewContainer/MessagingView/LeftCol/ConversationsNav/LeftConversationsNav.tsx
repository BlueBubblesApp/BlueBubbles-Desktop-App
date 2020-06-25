import * as React from 'react';
import './LeftConversationsNav.css';
import Conversation from './Conversation/Conversation';

//This will be used to store array of conversations
// for(conversations in database){
//     render(conversations[i])
// }

function LeftConversationsNav() {
    return (
        <div className="LeftConversationsNav">
            <Conversation></Conversation>
            <Conversation></Conversation>
            <Conversation></Conversation>
            <Conversation></Conversation>
            <Conversation></Conversation>
            <Conversation></Conversation>
        </div>
    );
}

export default LeftConversationsNav;
