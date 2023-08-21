import React from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  retrieveInstruction: (instruction: string) => void
}

const TheaterSidebar : React.FC<SidebarProps> = ({isOpen, onClose, retrieveInstruction}) => {

  return(
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button onClick={() => retrieveInstruction('YouTube')}> YouTube </button>
      <button onClick={() => retrieveInstruction('ShareScreen')}> ShareScreen </button>
      <button onClick={() => retrieveInstruction('Profile')}> Profile</button>
      <button onClick={onClose}> Close Sidebar </button>
    </div>
  )
}

export default TheaterSidebar
