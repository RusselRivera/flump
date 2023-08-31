import React, {useState, useEffect} from 'react'
import socket from '../sockets';
import 'reactjs-popup/dist/index.css';
import sessionInfo from './scenes/extra_components/SessionInfo'
import { useNavigate } from 'react-router-dom'

const IntroPopup : React.FC = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(true);

    useEffect(() => {
        socket.on('profile:changesReceived', () => {
            navigate("/")
        })
    })

    const submit = () => {
        let input_element = document.getElementById('username') as HTMLInputElement
        let username = input_element.value

        sessionInfo.username = username
    
        socket.emit('profile:changes', sessionInfo)
      }

    return (
        <div>
            Welcome to flump.io! <br/>
            To begin, type your desired display name. You will be able to change this later.
            <div>
                Username: <input id = "username" />
            </div>

            <button onClick = {submit}>Submit</button>
        </div>
    )
}

export default IntroPopup
