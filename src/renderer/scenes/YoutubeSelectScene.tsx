import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Playlist from './YT_Playlist';
import './YoutubeSelectScene.css'

function YT() {
  return (
    <div>
      <div className='title'>
        <p> This is the title area! </p>
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
