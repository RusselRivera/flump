import React from 'react'
import socket from '../../../sockets'
import { useNavigate } from 'react-router-dom'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  retrieveInstruction: (instruction: string) => void
}

const TheaterSidebar : React.FC<SidebarProps> = ({isOpen, onClose, retrieveInstruction}) => {
  const navigate = useNavigate();

  const goHome = () => {
      socket.emit('theater:leaveLobby')
      navigate("/")
  }

  return(
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button onClick={() => retrieveInstruction('YouTube')}> YouTube </button>
      <button onClick={() => retrieveInstruction('ShareScreen')}> ShareScreen </button>
      <button onClick={() => goHome()}> Home </button>
      <button onClick={() => retrieveInstruction('Profile')}> Profile</button>
      <button onClick={onClose}> Close Sidebar </button>
    </div>
  )
}

export default TheaterSidebar
