import React, {useState, useEffect} from 'react'
import Modal from 'react-modal'
import Source from './Source'
import './ShareScreenModal.css'
import { app } from 'electron'

interface ShareScreenModalProps {
  isOpen: boolean
  closeModal: () => void
  sources: Source[]
  handleSourceSelect: (src: Source) => void;
}

const ShareScreenModal : React.FC<ShareScreenModalProps> = ({isOpen, closeModal, sources, handleSourceSelect}) => {
  // Keep track of which source the user wants to display
  const [current_sources, setCurrentSources] = useState<Source[]>([])
  // 1 = Screens, 0 = Applications
  const [chooseScreen, setChooseScreen] = useState<boolean>(true)
  // Separate arrays for screens | applications
  const [screen_src, setScreenSrc] = useState<Source[]>([])
  const [app_src, setAppSrc] = useState<Source[]>([])

  useEffect(() => {
    // Set the current sources to the screen options by default: only if screen_src and app_src are fully loaded, and current_source hasn't been set yet
    if(screen_src.length + app_src.length === sources.length && current_sources.length === 0) {
      setCurrentSources(screen_src)
    }
  },[screen_src, app_src, current_sources])

  // Populate the two arrays with the correct sources
  const separateSources = () => {
    sources.forEach((src) => {
      if(src.id.substring(0,6) === 'screen') {
        setScreenSrc((oldSources) => [...oldSources, src])
      }
      else {
        setAppSrc((oldSources) => [...oldSources, src])
      }
    })
  }

  if(screen_src.length + app_src.length !== sources.length) {
    separateSources()
  }

  // Change displayed options
  const changeSource = () => {
    chooseScreen ? setCurrentSources(app_src) : setCurrentSources(screen_src)
    setChooseScreen(!chooseScreen)
  }

  return (
    <Modal className='modal' ariaHideApp={false} isOpen={isOpen} onRequestClose={closeModal}>
      <h1> Choose a Source to Share! </h1>
      {chooseScreen ? (<button onClick={changeSource}> Choose from Applications </button>) : (<button onClick={changeSource}> Choose from Screens </button>)}
      <ul>
        {current_sources.map((source) => (
          <li key = {source.id}>
            <img className='sourceSelect' onClick={() => handleSourceSelect(source)} src={source.thumbnailUrl} alt={source.name} />
            <p> {source.name} </p>
          </li>
        ))}
      </ul>
    </Modal>
  )
}

export default ShareScreenModal
