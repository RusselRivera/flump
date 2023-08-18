import React, { useEffect, useState } from 'react'
import '../css/Chat.css'

interface Props {
    username: string;
    message: string;
}

const Message: React.FC<Props> = (props) => {
        return (
            <div className="message">
                <div><strong>{props.username}:</strong> {props.message}</div>
            </div>
        );
    };

  export default Message;
