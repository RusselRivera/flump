import React, {useState, useEffect} from 'react';
import YouTube, {YouTubeProps} from 'react-youtube';
import axios from 'axios'

const Playlist: React.FC = () => {


  // State variable for the Video ID of the playlist
  const [playlist, setPlaylist] = useState<string[]>([])
  // State variable for the Input value of the client
  const [inputValue, setInputValue] = useState('')
  // State variable for the current video being played (its ID)
  const [currentVideo, setCurrentVideo] = useState('')
  // State variable for the Titles of the videos in the playlist
  const [videolist, setVideolist] = useState<string[]>([])
  // State variable for loop control
  const [loop, setLoop] = useState(false)

  // Disallow duplicates
  function checkDuplicate(vid: string) {
    for(let index = 0; index < playlist.length; index++) {
      if(playlist[index] == vid) {
        return true
      }
    }
    return false
  }

  const handleLoop = () => {
    setLoop(!loop)
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

    // player is not visible in this case, so render it as well by setting current video
    let empty_list = false
    if(playlist.length == 0) {
      empty_list = true
    }


    // As long as Video ID isn't undefined...
    if(vid_id !== null) {
      // Check for duplicates in the playlist
      let duplicate = checkDuplicate(vid_id)
      if(duplicate) {
        setInputValue('')
      }
      else {
        setPlaylist((prevPlaylist) => [...prevPlaylist, vid_id])
        getTitle(vid_id)
        setInputValue('')
        if(empty_list) {
          handlePlayVideo(vid_id)
        }
      }
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

  // Obtain title of video
  async function getTitle(video_id: string) {
    const api_key = 'AIzaSyAvyM3I2meRzqSvs0_T1CIVfd_Q7htP9UE'
    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${video_id}&key=${api_key}&part=snippet`)
      const video_title = response.data.items[0].snippet.title
      setVideolist((prevVideolist) => [...prevVideolist, video_title])
    }
    catch (error) {
      console.log('Error in retrieving title information:', error)
    }
  }

  // When video ends, dequeue and start the next video immediately
  const goNext = () => {
    const removed_id = playlist.shift()
    const removed_title = videolist.shift()
    // BUG: When a single video is looped, the code breaks and the video doesn't actually loop
    if(loop && removed_id !== undefined && removed_title !== undefined) {
      setPlaylist((prevPlaylist) => [...prevPlaylist, removed_id])
      setVideolist((prevVideolist) => [...prevVideolist, removed_title])
    }
    else {
      setPlaylist(playlist)
      setVideolist(videolist)
    }
    setCurrentVideo(playlist[0])
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
        {playlist.map((id,index) => (
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
