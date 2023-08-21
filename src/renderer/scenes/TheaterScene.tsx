import YT from './YoutubeSelectScene'
import ScreenShare from './ShareScreen'
import Profile from './ProfileScene'
import React, {useState} from 'react'
import Sidebar from './extra_components/TheaterSideBar'
import './css/TheaterScene.css'

const Theater : React.FC = () => {
  const [displayYT, setDisplayYT] = useState(false)
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
        displayShareScreen ? setDisplayShareScreen(false) : null
        displayProfile ? setDisplayProfile(false) : null
        displayYT ? null : setDisplayYT(true)
        break
      case 'ShareScreen':
        displayYT ? setDisplayYT(false) : null
        displayProfile ? setDisplayProfile(false) : null
        displayShareScreen ? null : setDisplayShareScreen(true)
        break
      case 'Profile':
        displayYT ? setDisplayYT(false) : null
        displayShareScreen ? setDisplayShareScreen(false) : null
        displayProfile ? null : setDisplayProfile(true)
    }
    toggleSidebar()
  }

  return (
    <div>
      <button className='sidebarButton' onClick={toggleSidebar}> Toggle Sidebar </button>
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} retrieveInstruction={receivedInfo}/>
      {displayYT && <YT/>}
      {displayShareScreen && <ScreenShare/>}
      {displayProfile && <Profile/>}
    </div>
  )
}

export default Theater
