import React, {useState, useEffect} from 'react'
import socket from '../../sockets'
import sessionInfo from './extra_components/SessionInfo'
import { session } from 'electron'
import './css/Profile.css'

const Profile : React.FC = () => {
  const [isReadOnly, setIsReadOnly] = useState(true)

  useEffect(() => {
    socket.on('profile:changesReceived', () => {
      toggleEdit()
    })

    return(() => {
      socket.off('profile:changesReceived')
    })
  })

  const toggleEdit = () => {
    console.log('Switching from ' + isReadOnly +' to ' + !isReadOnly)
    setIsReadOnly(!isReadOnly)
  }

  const saveSettingsButton = () => {
    let usernameInput = document.getElementById('username_input') as HTMLInputElement
    let emailInput = document.getElementById('email_input') as HTMLInputElement
    let bioInput = document.getElementById('bio_input') as HTMLInputElement
    let colorInput = document.getElementById('colorPicker') as HTMLInputElement

    sessionInfo.username = usernameInput.value
    sessionInfo.email = emailInput.value
    sessionInfo.bio = bioInput.value
    sessionInfo.color = colorInput.value

    socket.emit('profile:changes', sessionInfo)
  }

  return(
    <div>
      <div>
        Username : {isReadOnly ? (<input type="text" id='username_input' value={sessionInfo.username ?? ''} readOnly/>) : (<input type="text" id='username_input' defaultValue={sessionInfo.username ?? ''}/>)}
      </div>
      <div>
        Email : {isReadOnly ? (<input type="text" id='email_input' value={sessionInfo.email ?? ''} readOnly/>) : (<input type="text" id='email_input' defaultValue={sessionInfo.email ?? ''}/>)}
      </div>
      <div>
        {/* Bio : {isReadOnly ? (<input type="text" id='bio_input' value={sessionInfo.bio ?? ''} readOnly/>) : (<input type="text" id='bio_input' defaultValue={sessionInfo.bio ?? ''}/>)} */}
        <label> Bio </label>
        <div>{isReadOnly ? (<textarea id='bio_input' rows={4} cols={50} defaultValue={sessionInfo.bio ?? ''} readOnly/>) : (<textarea id='bio_input' rows={4} cols={50} defaultValue={sessionInfo.bio ?? ''}/>)}</div>
      </div>
      <div>
        Number of Persistant Lobbies Left: {sessionInfo.numPersistantLobbies}
      </div>
      <div>
        Authentication ID: {sessionInfo.auth_id}
      </div>
      <div>
        Current Socket ID: {sessionInfo.socket_id}
      </div>
      <div>
        Chat Color: {isReadOnly ? <input type='color' id='colorPicker' value={sessionInfo.color ?? '#000000'} readOnly/> : <input type='color' id='colorPicker' defaultValue={sessionInfo.color ?? '#000000'}/>}
      </div>
      <div>
        {isReadOnly && <button onClick={toggleEdit}> Edit </button>}
        {!isReadOnly && <button onClick={toggleEdit}> Cancel </button>}
        {!isReadOnly && <button onClick={saveSettingsButton}> Save </button>}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Profile />
  );
}
