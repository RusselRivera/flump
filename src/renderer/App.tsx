import socket from '../sockets';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import ResizableButton from './Button';
import YT from "./scenes/YoutubeSelectScene"
import Lobby_YT from "./scenes/YTLobbyCreationScene"
import Login from "./scenes/LoginScene"
import ShareScreen from "./scenes/ShareScreen"
import Theater from "./scenes/TheaterScene"
import { useNavigate } from 'react-router-dom'
import React, { useEffect } from 'react';
import sessionInfo from './scenes/extra_components/SessionInfo';
import IntroPopup from "./IntroPopup"

function Hello() {
  const navigate = useNavigate();

  useEffect(() => {
    let authtoken = window.electron.getToken()
    authtoken.then((token) => {
      console.log(token)
      socket.emit("authenticate", token)
    })
    // Obtain profile information when available (signalled by server)
    socket.on('session:obtainInfo', (username, auth_id, color, email, bio, numlobbies) => {
      sessionInfo.changeInfo(auth_id, socket.id, username, color, email, bio, numlobbies)

      if (sessionInfo.username === null) {
        navigate("/new_user")
      }

      console.log('Username: ' + sessionInfo.username + '\nAuthentication ID: ' + sessionInfo.auth_id + '\nSocket ID: ' + sessionInfo.socket_id + '\nColor: ' + sessionInfo.color)
    })
  })

  const handleButtonClick = () => {
    window.electron.ipcRenderer.sendMessage("openExternalLink", "http://localhost:35565/login");
  }

  const logOut = () => {
    window.electron.logOut();
  }
  
  const test = () => {
    navigate("/new_user")
  }

  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <button id = "login-button" onClick = {handleButtonClick}></button>
      <button id = "login-button" onClick = {logOut}>Logout</button>
      <button id = "login-button" onClick = {test}>Test</button>
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
        <Route path="/Lobby_YT" element={<Lobby_YT />} />
        <Route path="/theater" element={<Theater/>} />
        <Route path="/nico" element={<ShareScreen />} />
        <Route path="/new_user" element={<IntroPopup />} />
      </Routes>
    </Router>
  );
}
