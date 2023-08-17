import React, {useEffect, useRef, useState} from 'react'
import socket from '../../sockets'
import './css/Chat.css'
import Message from './extra_components/Message'

const Chat: React.FC = () => {
  const [elements, setElements] = useState<JSX.Element[]>([])
  const scrollPosRef = useRef<HTMLDivElement | null>(null)
  const [newMessage, setNewMessage] = useState(false)
  const [bottom, setBottom] = useState(false)
  let bot = false


  function sendMessage() {
    let chat_input = document.getElementById('chat-input') as HTMLInputElement
    let message = chat_input.value

    if (chat_input.value === "") {
      return
    }

    socket.emit('chat:sendMessage', message)

    chat_input.value = ""
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      sendMessage()
    }
  } 

  useEffect(() => {
    socket.on('chat:propogateMessage', (username, message) => {
      console.log(username + ": " + message)

      let prop_username = username
      let prop_message = message

      const ref = scrollPosRef.current;
      let bot = ref !== null && (ref.scrollTop === ref.scrollHeight - ref.clientHeight)
      setBottom(bot)

      const newElement = <Message username = {prop_username} message = {prop_message} />
      setElements(prevElements => [...prevElements , newElement])

      setNewMessage(true)
    })
  }, [])

  useEffect(() => {
    setNewMessage(false)

    if (scrollPosRef.current && bottom) {

      const ref = scrollPosRef.current;

      const diff = ref.scrollHeight - ref.clientHeight;
      
      ref.scrollTop += diff;
    }
  }, [elements]);
  
  return (
    <div>
      <div className="top" ref={scrollPosRef}>
        {elements}
      </div>
      <div className="bottom">
          <input id="chat-input" onKeyDown = {handleKeyDown}></input>
      </div>
    </div>
  )

}

export default Chat;
