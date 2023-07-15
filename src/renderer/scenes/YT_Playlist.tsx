import React, {useState, useEffect, useRef} from 'react';
import YouTube, {YouTubeProps, YT} from 'react-youtube';
import { useLocation } from 'react-router-dom';
import axios from 'axios'
import socket from '../../sockets'
import { useNavigate } from 'react-router-dom'
import './YT_Playlist.css';

const Playlist: React.FC = () => {

  const playerReference = React.useRef<YouTube>(null)
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
    // Server broadcasting playback changes
    socket.on('receiveInfo', (playbackState, playbackTime) => {
      updatePlayer(playbackState, playbackTime)
    })
    socket.on('rateChange', (playbackRate) => {
      changePlayerRate(playbackRate)
    })
    window.addEventListener('resize', handleResize)
    // IDK bruv
    return () => {
      socket.off('serverResponse')
      window.removeEventListener('resize', handleResize)
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
    console.log(window.outerWidth + " " + window.outerHeight)
  }
  // Event handler for when a client pauses, unpauses, or scrubs the video
  const handlePlaybackChange = (event:  YT.onStateChangeEvent) => {
    const player = event?.target
    const playbackState = player.getPlayerState()
    const playerTime = player.getCurrentTime()
    console.log("Player State Changed:", playbackState)
    if(playbackState != YouTube.PlayerState.BUFFERING) {
      socket.emit('playbackChange', playbackState, playerTime)
    }
  }

  // Update the player with info received from the server (essentially changes from other clients to the player state)
  const updatePlayer = (playbackState : YT.PlayerState, playbackTime: number) => {
    console.log("Received instructions from server")
    const player = playerReference.current?.internalPlayer
    player.seekTo(playbackTime, true)
    if(player.getPlayerState() !== playbackState && player.getPlayerState() != YouTube.PlayerState.BUFFERING) {
      if(playbackState === YouTube.PlayerState.PAUSED) {
        player.pauseVideo()
      }
      else if(playbackState === YouTube.PlayerState.PLAYING) {
        player.playVideo()
      }
    }
  }

  // Playback Rate is changed
  const onRateChange = (event : YT.YouTubeEvent<number>) => {
    socket.emit('playbackRateChange', event.target.getPlaybackRate())
  }

  // Change the player rate
  const changePlayerRate = (playerRate : number) => {
    const player = playerReference.current?.internalPlayer
    player.setPlaybackRate( playerRate)
  }

  // Updates server with the time stamp of the video every 3 seconds
  const updateTime = async () => {
    const player = playerReference.current?.internalPlayer
    if(player === undefined) {
      return
    }
    if(player.getPlayerState() !== YouTube.PlayerState.ENDED) {
      const time = await player.getCurrentTime()
      socket.emit('updateTime', time)
    }
  }
  setInterval(updateTime, 1000)

  const opts: YouTubeProps['opts'] = {
    height: '380',
    width: '630',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  };

  const handleResize = () => {
    const player = playerReference.current?.internalPlayer
    const width_difference = window.outerWidth - 1281
    const height_difference = window.outerHeight - 700
    if(player) {
      player.setSize(630 + width_difference * 0.5, 380 + height_difference * 0.45)
    }
  }

  return (
    <div className="main_container">
      <div className="controls">
        <h3 className='addVidTitle'> Add Video:  </h3>
        <input type = "text" className='vid_input' value = {inputValue} onChange = {handleInputChange} />
        <button className="add_button" onClick = {handleAddId}> Add</button>
      </div>
      <div className="sub_container1">
        <div className="player">
          {currentVideo && <YouTube videoId = {currentVideo} opts = {opts} onReady={handleResize} onEnd={goNext} onStateChange={handlePlaybackChange} onPlaybackRateChange={event => {onRateChange(event)}} ref={playerReference}/>}
        </div>
        <div className="playlist">
          <div className='p_controller'>
            <button className="p_button" onClick = {goNext}> Skip</button>
            <button className="p_button" onClick = {handleLoop}> Loop</button>
          </div>
          {videolist.map((id,index) => (
            <div key = {index} className="item">
              {videolist[index]}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

}

export default Playlist;
