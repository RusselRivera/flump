import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Playlist from './YT_Playlist';
import { useLocation } from 'react-router-dom';
import './css/YoutubeSelectScene.css'

function YT() {
  const location = useLocation()
  let lobby_id = location.state.lobby_id
  let lobby_name = location.state.lobby_name
  return (
    <div>
      <div className='title'>
        <h1> Lobby Name: {lobby_name} Lobby ID: {lobby_id} </h1>
      </div>
      <div className='player_and_playlist'>
        <Playlist />
      </div>
      <div className='chat'>
        <p> This is the chat area! </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <YT />
  );
}
