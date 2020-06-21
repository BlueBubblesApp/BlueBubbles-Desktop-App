import React from 'react';
import '../Conversation/Conversation.css';
import ContactImage from '../../../assets/contact-icon.png'
import ConversationCloseIcon from '../../../assets/conversation-close-icon.png';


//LOAD IN FROM BACKEND
const messagePreview = {
    recipients: 'Maxwell Fortney',
    recentMessage: 'Thanks for the message!',
    recentMessageTimestamps: '3:13 PM'
};


function Conversation() {
  return (
    <div className="Conversation">
                    <div className="contact-card"><img className="contact-icon"
                            src={ContactImage}></img></div>
                    <div className="message-prev">
                        <div className="prev-top">
                            <div className="message-recip">
                                <div>
                                    <p className="message-recip-example">{messagePreview.recipients}</p>
                                </div>
                            </div>
                            <div className="message-time">
                                <div>
                                    <p className="message-time-example">{messagePreview.recentMessageTimestamps}</p>
                                </div>
                            </div>
                        </div>
                        <div className="prev-bottom">
                            <div className="message-snip">
                                <div>
                                    <p className="message-snip-example">{messagePreview.recentMessage}
                                    </p>
                                </div>
                            </div>
                            <div className="message-del"><img className="message-del-conversation"
                                    src={ConversationCloseIcon}></img></div>
                        </div>
                    </div>
                </div>
  );
}

export default Conversation;
