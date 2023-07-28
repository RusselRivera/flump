import socket from '../sockets';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import ResizableButton from './Button';
import YT from "./scenes/YoutubeSelectScene"
import Lobby_YT from "./scenes/YTLobbyCreationScene"
import Login from "./scenes/LoginScene"
import ShareScreen from "./scenes/ShareScreen"
import { useNavigate } from 'react-router-dom'
import React, { useEffect } from 'react';

function Hello() {
  const navigate = useNavigate();

  
  useEffect(() => {
    let authtoken = window.electron.getToken()  
    authtoken.then((token) => {
      console.log(token)
      socket.emit("authenticate", token)
    })
  })

  const handleButtonClick = () => {
    window.electron.ipcRenderer.sendMessage("openExternalLink", "http://localhost:35565/login");
  }

  const logOut = () => {
    window.electron.logOut();
  }

  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <button id = "login-button" onClick = {handleButtonClick}></button>
      <button id = "login-button" onClick = {logOut}>Logout</button>
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
        <Route path="/nico" element={<ShareScreen />} />
      </Routes>
    </Router>
  );
}
