import './css/YoutubeSelectScene.css'
import { useLocation } from 'react-router-dom';
import { TwitchPlayer } from 'react-twitch-embed';
import Chat from './Chat';
import React, {useState, useEffect} from 'react';
import socket from '../../sockets'

function Twitch() {
    const [currentChannel, setCurrentChannel] = useState('')
    
    const location = useLocation()
    let lobby_id = location.state.lobby_id
    let lobby_name = location.state.lobby_name
    
    useEffect(() => {
        socket.emit('theater:joinTwitch')

        
        socket.on('theater:changeChannel', (channel) => {
            setCurrentChannel(channel)
        })
    }, [])

    const setChannel = () => {
        let channel = document.getElementById('id_channel') as HTMLInputElement
        
        socket.emit('theater:setChannel', channel.value)
    }

    return (
        <div>
            <div className='title'>
                <h1> Lobby Name: {lobby_name} Lobby ID: {lobby_id} </h1>
            </div>
            <div className='player_and_playlist'>
                <div className="controls">
                    <h3 className='addVidTitle'> Change Channel:  </h3>
                    <input type = "text" className='vid_input' id = "id_channel"/>
                    <button className="add_button" onClick = {setChannel}> Add</button>
                </div>
                {currentChannel !== "" && <TwitchPlayer channel = {currentChannel}/>}
            </div>
            <div className='chat'>
                <Chat />
            </div>
        </div>
    );
}

export default function App() {
  return (
    <Twitch />
  );
}
