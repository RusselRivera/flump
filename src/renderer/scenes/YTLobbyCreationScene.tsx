import socket from '../../sockets'
import { useNavigate } from 'react-router-dom'
import React, { useEffect } from 'react';
import YT from "./YoutubeSelectScene"
import Theater from "./TheaterScene"
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './css/YTLobbyCreationScene.css'
import sessionInfo from './extra_components/SessionInfo'

function Lobby_YT() {

  const navigate = useNavigate();

  useEffect(() => {
    window.electron.ipcRenderer.on('login-data', (message: string) => {
      console.log(message.substring(message.indexOf("?data=") + "?data=".length));
    });
  }, []);

  // Server will send 'lobbyJoin' to have the client join a lobby
  socket.on('theater:pushLobbyScene', (lobby_id) => {
    navigate("/theater", {
      state: {
        lobby_id: lobby_id,
      }
    });
  })

  // Server will send 'noLobby' if the lobby id given is not valid
  socket.on('theater:noLobby', () => {
    let response = document.getElementById('lobby-id-response') as HTMLSpanElement
    response.innerText = "Lobby not found"
  })

  // Server will send 'noPassword' if the lobby password given is not valid
  socket.on('theater:noPassword', () => {
    let response = document.getElementById('lobby-password-response')  as HTMLSpanElement
    response.innerText = "Incorrect password"
  })

  const joinLobbyButton = () => {
    let id_input = document.getElementById('join-lobby-ID') as HTMLInputElement
    let password_input = document.getElementById('join-lobby-password') as HTMLInputElement
    let lobby_id = id_input.value;
    let lobby_password = password_input.value;

    socket.emit('theater:checkLobby', lobby_id, lobby_password)
  }

  const createLobbyButton = () => {
    let name_input = document.getElementById('create-lobby-name') as HTMLInputElement
    let privacy_input = document.getElementsByName('create-lobby-privacy')
    let description_input = document.getElementById('create-lobby-description') as HTMLInputElement
    let password_input = document.getElementById('create-lobby-password') as HTMLInputElement
    let persistence_input = document.getElementsByName('create-lobby-persistence')

    let name = name_input.value
    let privacy
    let description = description_input.value
    let password = password_input.value
    let persistence

    for (let i = 0; i < privacy_input.length; i++) {
      let radio_button = privacy_input[i] as HTMLInputElement
      if (radio_button.checked == true) {
        privacy = radio_button.value
      }
    }

    for(let i = 0; i < persistence_input.length; i++) {
      let radio_button = persistence_input[i] as HTMLInputElement
      if(radio_button.checked == true) {
        persistence = radio_button.value
      }
    }

    // Decrement the number of persistent lobbies the user can create by one
    if(persistence === 'yes' && sessionInfo.numPersistantLobbies > 0) {
      sessionInfo.numPersistantLobbies--
    }
    else {
      persistence = 'no'
    }

    socket.emit('theater:createLobby', name, privacy, description, password, persistence, sessionInfo.auth_id)
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
          Private:
            Yes <input className='radio_button' type="radio" name="create-lobby-privacy" value="yes" defaultChecked />
            No <input className='radio_button' type="radio" name="create-lobby-privacy" value="no" />
        </div>
        <div className='input'>
          Persistant:
            Yes <input className='radio_button' type="radio" name="create-lobby-persistence" value="yes" />
            No <input className='radio_button' type="radio" name="create-lobby-persistence" value="no" defaultChecked />
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
