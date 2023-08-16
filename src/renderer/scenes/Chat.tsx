import React, {useEffect} from 'react'
import socket from '../../sockets'
import './css/Chat.css'

const Chat: React.FC = () => {
  
  const sendMessage = () => {
    let chat_input = document.getElementById('chat-input')  as HTMLInputElement
    let message = chat_input.value
    socket.emit('chat:sendMessage', message)
  }
  
  useEffect(() => {
    socket.on('chat:propogateMessage', (username, message) => {
      console.log(username + ": " + message)
    })
  }, [])
  
  return (
    <div className="parent">
        <div className="bottom">
            <input id="chat-input"></input>
            <button id = "chat-button" onClick = {sendMessage}></button>
        </div>
    </div>
  )

}

export default Chat;
