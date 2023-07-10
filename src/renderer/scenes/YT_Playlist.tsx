import React, {useState, useEffect} from 'react';
import YouTube, {YouTubeProps} from 'react-youtube';
import { useLocation } from 'react-router-dom';
import axios from 'axios'
import socket from '../../sockets'
import { useNavigate } from 'react-router-dom'

const Playlist: React.FC = () => {
  const navigate = useNavigate();

  // State variable for the Video ID of the playlist
  const [playlist, setPlaylist] = useState<string[]>([])
  // State variable for the Input value of the client
  const [inputValue, setInputValue] = useState('')
  // State variable for the current video being played (its ID)
  const [currentVideo, setCurrentVideo] = useState('')
  // State variable for the Titles of the videos in the playlist
  const [videolist, setVideolist] = useState<string[]>([])
  
  const location = useLocation()

  // All socket response stuff goes here
  useEffect(() => {
    // When the client connects back to the server, retrieve the video currently being played and update the playlist
    let lobby_id = location.state.lobby_id

    console.log(lobby_id)

    console.log("joining lobby " + lobby_id)

    socket.emit('lobbyJoin')
    // When the server responds to the client with what video to play
    socket.on('playVideo', (vid_url) => {
      console.log("Received video to play:", vid_url)
      handlePlayVideo(vid_url)
    })
    socket.on('return', () => {
      navigate("/", {
        state: {
          message: 'no_lobby',
        }
      })
    })
    // When the server tells the client that the playlist has been updated, re-render the list of videos queued
    socket.on('updatePlaylist', (videos) => {
      console.log("Update Playlist Request Received")
      updatePlaylist(videos)
    })
    // IDK bruv
    return () => {
      socket.off('serverResponse')
    }
  }, [])

  const handleLoop = () => {
    socket.emit('toggleLoop')
  }
  // Detects input event and updates
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  }
  // Allows the client to add a video to the playlist via video ID: appends the video the end of the lsit
  const handleAddId = () => {
    // Take URL and obtain the Video ID from it - Make sure that it's not undefined
    if(inputValue.trim() == '') {
      return
    }
    const params = new URLSearchParams(new URL (inputValue).search)
    const vid_id = params.get('v')

    // As long as Video ID isn't undefined...
    if(vid_id !== null) {
      socket.emit('addVideo', vid_id)
      setInputValue('')
    }
    else {
      setInputValue('')
    }
  }
  // Set the current video
  const handlePlayVideo = (videoId: string) => {
    setCurrentVideo(videoId);
  }
  // When the Youtube player is ready ...
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    event.target.playVideo();
  }
  // Updates queue of videos
  async function updatePlaylist(videos : string[]) {
    // Clear the video list and re-render
    setVideolist([])
    console.log(videos)
    console.log("Obtaining Titles...")
    for(let i = 0; i < videos.length; i++) {
      await getTitle(videos[i])
    }
  }
  // Obtain title of video
  async function getTitle(video_id: string) {
    const api_key = 'AIzaSyAvyM3I2meRzqSvs0_T1CIVfd_Q7htP9UE'
    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${video_id}&key=${api_key}&part=snippet`)
      const video_title = response.data.items[0].snippet.title
      console.log("Video title found:", video_title)
      setVideolist((prevVideolist) => [...prevVideolist, video_title])
    }
    catch (error) {
      console.log('Error in retrieving title information:', error)
    }
  }
  // When video ends, dequeue and start the next video immediately
  const goNext = () => {
    socket.emit('goNext')
  }
  const opts: YouTubeProps['opts'] = {
    height: '390',
    width: '640',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  };

  return (
    <div>
      <h2> My Playlist </h2>
      <input type = "text" value = {inputValue} onChange = {handleInputChange} />
      <button onClick = {handleAddId}> Add Video ID</button>
      <button onClick = {goNext}> Skip Video</button>
      <button onClick = {handleLoop}> Loop</button>
      <ul>
        {videolist.map((id,index) => (
          <li key = {index}>
            {videolist[index]}
            </li>
        ))}
      </ul>
      {currentVideo && <YouTube videoId = {currentVideo} opts = {opts} onReady={onPlayerReady} onEnd={goNext}/>}
    </div>
  )

}

export default Playlist;
