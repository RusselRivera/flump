import YT from './YoutubeSelectScene'
import Twitch from './TwitchScene'
import ScreenShare from './ShareScreen'
import Profile from './ProfileScene'
import React, {useState} from 'react'
import Sidebar from './extra_components/TheaterSideBar'
import './css/TheaterScene.css'

const Theater : React.FC = () => {
  const [displayYT, setDisplayYT] = useState(false)
  const [displayTwitch, setDisplayTwitch] = useState(false)
  const [displayShareScreen, setDisplayShareScreen] = useState(false)
  const [displayProfile, setDisplayProfile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Toggle the sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Obtain client instructions based on button clicked in sidebar
  const receivedInfo = (task : string) => {
    // Figure out which component must be displayed
    switch(task) {
      case 'YouTube':
        displayYT ? null : setDisplayYT(true)
        displayTwitch ? setDisplayTwitch(false) : null
        displayShareScreen ? setDisplayShareScreen(false) : null
        displayProfile ? setDisplayProfile(false) : null
        break
      case 'Twitch':
        displayYT ? setDisplayYT(false) : null
        displayTwitch ? null: setDisplayTwitch(true) 
        displayShareScreen ? setDisplayShareScreen(false) : null
        displayProfile ? setDisplayProfile(false) : null
        break
      case 'ShareScreen':
        displayYT ? setDisplayYT(false) : null
        displayTwitch ? setDisplayTwitch(false) : null
        displayShareScreen ? null : setDisplayShareScreen(true)
        displayProfile ? setDisplayProfile(false) : null
        break
      case 'Profile':
        displayYT ? setDisplayYT(false) : null
        displayTwitch ? setDisplayTwitch(false) : null
        displayShareScreen ? setDisplayShareScreen(false) : null
        displayProfile ? null : setDisplayProfile(true)
        break
    }
    toggleSidebar()
  }

  return (
    <div>
      <button className='sidebarButton' onClick={toggleSidebar}> Toggle Sidebar </button>
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} retrieveInstruction={receivedInfo}/>
      {displayYT && <YT/>}
      {displayTwitch && <Twitch/>}
      {displayShareScreen && <ScreenShare/>}
      {displayProfile && <Profile />}
    </div>
  )
}

export default Theater
