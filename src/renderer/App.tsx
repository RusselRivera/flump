import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import ResizableButton from './Button';
import YT from "./scenes/YoutubeSelectScene"
import Login from "./scenes/LoginScene"
import { useNavigate } from 'react-router-dom'
import socket from '../sockets'

function Hello() {
  const navigate = useNavigate();

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
    let response = document.getElementById('lobby-id-response')
    response.innerText = "Lobby not found"
  })

  // Server will send 'noPassword' if the lobby password given is not valid
  socket.on('noPassword', () => {
    let response = document.getElementById('lobby-password-response')
    response.innerText = "Incorrect password"
  })

  const joinLobbyButton = () => {
    let id_input = document.getElementById('join-lobby-ID')
    let password_input = document.getElementById('join-lobby-password')
    let lobby_id = id_input.value;
    let lobby_password = password_input.value;

    socket.emit('checkLobby', lobby_id, lobby_password)
  }

  const createLobbyButton = () => {
    let name_input = document.getElementById('create-lobby-name')
    let privacy_input = document.getElementsByName('create-lobby-privacy')
    let description_input = document.getElementById('create-lobby-description')
    let password_input = document.getElementById('create-lobby-password')

    let name = name_input.value
    let privacy
    let description = description_input.value
    let password = password_input.value

    for (let i = 0; i < privacy_input.length; i++) {
      if (privacy_input[i].checked == true) {
        privacy = privacy_input[i].value
      }
    }

    socket.emit('createLobby', name, privacy, description, password)
  }

  const handleButtonClick = () => {
    window.electron.ipcRenderer.sendMessage("openExternalLink", "http://google.com");
  }

  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <button id = "login-button" onClick = {handleButtonClick}></button>
      <div className="Hello" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridGap: 20 }}>
        <div>
          <ResizableButton id = "youtube" />
        </div>
        <div>
          <ResizableButton id = "twitch"/>
        </div>
        <div>
          <ResizableButton id = "spotify"/>
        </div>
        <div>
          <ResizableButton id = "nico"/>
        </div>
      </div>
      <br></br>
      <div>
        Lobby ID: <input id = "join-lobby-ID" /><span id = "lobby-id-response"></span>
      </div>
      <div>
        Lobby Password: <input id = "join-lobby-password" /><span id = "lobby-password-response"></span>
      </div>
      <button id = "login-button" onClick = {joinLobbyButton}>Join Lobby by ID</button>
      <br></br>
      <div>
        Lobby Name: <input id = "create-lobby-name" />
      </div>
      <div>
        Private: <input type="radio" name="create-lobby-privacy" value="yes" checked />
          Yes<input type="radio" name="create-lobby-privacy" value="no" />
          No
      </div>
      <div>
        Description: <input id = "create-lobby-description" />
      </div>
      <div>
        Password: <input id = "create-lobby-password" />
      </div>
      <button id = "login-button" onClick = {createLobbyButton}>Create New Lobby</button>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
        <Route path="/YT" element={<YT />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}
