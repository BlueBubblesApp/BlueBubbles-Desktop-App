import * as React from 'react';
import './OutgoingMessage.css';

const message = {
    text: 'Outgoing Message'
};

function OutgoingMessage() {
    return (
        <div className="OutgoingMessage">
            <p>{message.text}</p>
        </div>
    );
}

export default OutgoingMessage;
