import socket from '../../sockets'
import { useNavigate } from 'react-router-dom'
import React, { useEffect } from 'react';
import YT from "./YoutubeSelectScene"
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './YTLobbyCreationScene.css'

function Lobby_YT() {

  const navigate = useNavigate();

  useEffect(() => {
    window.electron.ipcRenderer.on('login-data', (message: string) => {
      console.log(message.substring(message.indexOf("?data=") + "?data=".length));
    });
  }, []);

  // Server will send 'lobbyJoin' to have the client join a lobby
  socket.on('joinLobby', (lobby_id) => {
    navigate("/YT", {
      state: {
        lobby_id: lobby_id,
      }
    });
  })

  // Server will send 'noLobby' if the lobby id given is not valid
  socket.on('noLobby', () => {
    let response = document.getElementById('lobby-id-response') as HTMLSpanElement
    response.innerText = "Lobby not found"
  })

  // Server will send 'noPassword' if the lobby password given is not valid
  socket.on('noPassword', () => {
    let response = document.getElementById('lobby-password-response')  as HTMLSpanElement
    response.innerText = "Incorrect password"
  })

  const joinLobbyButton = () => {
    let id_input = document.getElementById('join-lobby-ID') as HTMLInputElement
    let password_input = document.getElementById('join-lobby-password') as HTMLInputElement
    let lobby_id = id_input.value;
    let lobby_password = password_input.value;

    socket.emit('checkLobby', lobby_id, lobby_password)
  }

  const createLobbyButton = () => {
    let name_input = document.getElementById('create-lobby-name') as HTMLInputElement
    let privacy_input = document.getElementsByName('create-lobby-privacy')
    let description_input = document.getElementById('create-lobby-description') as HTMLInputElement
    let password_input = document.getElementById('create-lobby-password') as HTMLInputElement

    let name = name_input.value
    let privacy
    let description = description_input.value
    let password = password_input.value

    for (let i = 0; i < privacy_input.length; i++) {
      let radio_button = privacy_input[i] as HTMLInputElement
      if (radio_button.checked == true) {
        privacy = radio_button.value
      }
    }

    socket.emit('createLobby', name, privacy, description, password)
  }

  return (
    <div>
      <div className='joinLobby'>
        <div className='header'>
          JOIN A LOBBY!
        </div>
        <div className='input'>
          Lobby ID: <input className='text_input' id = "join-lobby-ID" /><span id = "lobby-id-response"></span>
        </div>
        <div className='input'>
          Lobby Password: <input className='text_input' id = "join-lobby-password" /><span id = "lobby-password-response"></span>
        </div>
        <button className='button' id = "login-button" onClick = {joinLobbyButton}>Join Lobby by ID</button>
      </div>

      <div className='createLobby'>
        <div className='header'>
          CREATE A LOBBY!
        </div>
        <div className='input'>
          Lobby Name: <input className='text_input' id = "create-lobby-name" />
        </div>
        <div className='input'>
          Private: <input className='radio_button' type="radio" name="create-lobby-privacy" value="yes" checked />
            Yes<input className='radio_button' type="radio" name="create-lobby-privacy" value="no" />
            No
        </div>
        <div className='input'>
          Description: <input className='text_input' id = "create-lobby-description" />
        </div>
        <div className='input'>
          Password: <input className='text_input' id = "create-lobby-password" />
        </div>
        <button className='button' id = "login-button" onClick = {createLobbyButton}>Create New Lobby</button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Lobby_YT />
  );
}
