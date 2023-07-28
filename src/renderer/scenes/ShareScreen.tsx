import React, {useState, useEffect, useRef} from 'react'
import socket from '../../sockets'
import SimplePeer from 'simple-peer'
import Source from './extra_components/Source'
import ShareScreenModal from './extra_components/ShareScreenModal'
import { ipcRenderer } from 'electron'

const ScreenShare: React.FC = () => {
  // Variable containing the different screen / application sources to display
  const [sources, setSources] = useState<Source[]>([])
  // Variable to keep track of the Modal state
  const [isModalOpen, setModalOpen] = useState<boolean>(false)
  // Variable to keep track of current stream
  const [selectedStream, setSelectedStream] = useState<MediaStream | undefined>(undefined)
  // 0 = No sharing, 1 = Sharing, 2 = someone else is sharing
  const [isSharing, setIsSharing] = useState<number>(0)
  // Reference for the video player
  const videoRef = useRef<HTMLVideoElement | null>(null)
  // List of peers (only the initiator / streamer will have more than one)
  const peers : SimplePeer.Instance[] = []
  let flag = true;

  socket.emit('connectSS', socket.id)

  const openModal = () => setModalOpen(true)
  const closeModal = () => setModalOpen(false)

  useEffect(() => {
    if(selectedStream && videoRef.current) {
      videoRef.current.srcObject = selectedStream
      if(isSharing === 1) {
        socket.emit('initiateSharing', socket.id)
      }
    }

    socket.on('startConnection', (receiver_id) => {
      initiateSharing(receiver_id)
    })
    // Offer is sent to receivers
    socket.on('offer', (data) => {
      handleOffer(data)
    })
    // Answer is sent to the initiator
    socket.on('answer', (data) => {
        handleAnswer(data)
    })
    // Clean up after stream ends
    socket.on('shareEnded', () => {
      handleShareEnded()
    })

    return () => {
      socket.removeAllListeners()
    }
  }, [selectedStream])


  const handleShareEnded = () => {
    if(videoRef.current) {
      videoRef.current.srcObject = null
    }
    cleanup()
  }

  const cleanup = () => {
    socket.removeAllListeners()
    while(peers.length !== 0) {
      const peer = peers.pop()
      peer?.removeAllListeners()
      peer?.destroy()
    }
    setIsSharing(0)
    socketRestart()
  }

  const socketRestart = () => {
    socket.on('answer', (data) => handleAnswer(data))
    socket.on('offer', (data) => handleOffer(data))
    socket.on('shareEnded', () => handleShareEnded())
    socket.on('startConnection', (receiver_id) => initiateSharing(receiver_id))
  }

  const handleSourceSelect = async (source : Source) => {
    closeModal();
    console.log(source.id);
    console.log(source.name);
    try{
      const stream = await (navigator.mediaDevices as any).getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: source.id,
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720,
          }
        }
      })
      setSelectedStream(stream)
      setIsSharing(1)
    }
    catch (error) {
      console.error("Error getting user media:", error)
    }
  }

  const chooseScreen = () => {
    window.electron.ipcRenderer.sendMessage("getVideoSources");
    window.electron.ipcRenderer.on('resulting_sources', (result : Source[]) => {
      const sources = result
      setSources(sources)
      openModal()
    })
  }

  const stopSharing = () => {
    selectedStream?.getTracks().forEach(track => track.stop())
    socket.emit('shareEnded')
    setSelectedStream(undefined)
    setIsSharing(0)
  }

  // Create a peer instance depending on whether the client is a receiver or initiator
  const createPeer = async (init : boolean) => {
    console.log("peer created!")
    if(init) {
      const newPeerInstance = new SimplePeer({initiator: true, stream: selectedStream})
      peers.push(newPeerInstance)
    }
    else {
      const newPeerInstance = new SimplePeer()
      peers.push(newPeerInstance)
    }
  }

  const initiateSharing = (receiver_id : string) => {
      createPeer(true)
      attachInitiatorEvents(peers[peers.length-1], receiver_id)
  }

  const attachInitiatorEvents = (peer : SimplePeer.Instance, receiver_id : string) => {
    peer.on('signal', (data) => {
      // Socket to send offer to receiver
      console.log("emitting offer to", receiver_id)
      socket.emit('offer', data, receiver_id)
    })
    peer.on('close', () => {
      // Code to run when connection is closed
    })
  }

  const attachReceiverEvents = (peer : SimplePeer.Instance) => {
    peer.on('signal', (data) => {
      // Socket to send answer to initiator
      socket.emit('answer', data)
    })
    peer.on('close', () => {
      // Code to run when connection is closed
    })
    peer.on('connect', () => {
      // Connection is fully established
      console.log("Connection fully established!")
      setIsSharing(2)
      socket.emit('nextConnection')
    })
    peer.on('stream', (stream) => {
      // Code to set the stream of the receiver to that of the initiator
      setSelectedStream(stream)
    })
  }

  const handleOffer = async (data : any) => {
    if(isSharing === 0) {
      // Create a new peer to handle the received data only if no peers exist
      if(peers.length === 0) {
        await createPeer(false)
        attachReceiverEvents(peers[0])
        peers[0].signal(data)
      }
      // Receiving peer exists, signal with the offer
      else {
        peers[0].signal(data)
      }
    }
  }

  const handleAnswer = (data : any) => {
    if(isSharing === 1) {
      peers[peers.length-1].signal(data)
    }
  }

  const printStuff = () => {
    console.log(peers)
    console.log(peers.length)
    console.log(flag)
  }

  return (
    <div>
      {isSharing === 0 && (<button onClick={chooseScreen}>Share Screen</button>)}
      {isSharing === 1 && (<button onClick={stopSharing}>Stop Sharing</button>)}
      <ShareScreenModal isOpen={isModalOpen} closeModal={closeModal} sources={sources} handleSourceSelect={handleSourceSelect} />
      {selectedStream && <video ref={videoRef} autoPlay></video>}
      {isSharing === 2 && <button onClick = {handleShareEnded}> Disconnect from Stream </button>}
      <button onClick={printStuff}> Get Info </button>
    </div>
  )
}

export default ScreenShare
