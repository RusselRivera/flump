import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Playlist from './YT_Playlist';

function YT() {
  return (
    <div>
        Hello World!
        <Playlist />
    </div>
  );
}

export default function App() {
  return (
    <YT />
  );
}
