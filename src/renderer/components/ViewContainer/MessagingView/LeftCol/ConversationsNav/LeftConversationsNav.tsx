import * as React from "react";
import "./LeftConversationsNav.css";
import Conversation from "./Conversation/Conversation";
import { BrowserRouter as Router, NavLink } from "react-router-dom";




class LeftConversationsNav extends React.Component {
    state = {
        chats: [
            {

            }
        ]
    }

    render(){
    return (
        <div className="LeftConversationsNav">
            <Conversation chatParticipants="+1 (703) 201-7026" lastMessage="Test Message" lastMessageTime="3:13 PM"/>
            <Conversation chatParticipants="+1 (703) 201-7026" lastMessage="Test Message" lastMessageTime="3:13 PM"/>
            <Conversation chatParticipants="+1 (703) 201-7026" lastMessage="Test Message" lastMessageTime="3:13 PM"/>
            <Conversation chatParticipants="+1 (703) 201-7026" lastMessage="Test Message" lastMessageTime="3:13 PM"/>
            <Conversation chatParticipants="+1 (703) 201-7026" lastMessage="Test Message" lastMessageTime="3:13 PM"/>
        </div>
    );
    }
};

export default LeftConversationsNav;
