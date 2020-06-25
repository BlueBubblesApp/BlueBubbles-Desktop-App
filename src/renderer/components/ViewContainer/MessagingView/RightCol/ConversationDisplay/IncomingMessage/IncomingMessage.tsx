import * as React from 'react';
import './IncomingMessage.css';

const message = {
    text: 'Incoming Message'
};

function IncomingMessage() {
    return (
        <div className="IncomingMessage">
            <p>{message.text}</p>
        </div>
    );
}

export default IncomingMessage;
