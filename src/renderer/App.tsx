import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import ResizableButton from './Button';
import YT from "./scenes/YoutubeSelectScene"

function Hello() {
  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
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
      </Routes>
    </Router>
  );
}
