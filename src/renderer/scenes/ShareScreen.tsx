import socket from '../../sockets'
import React, {useState, useEffect, useRef} from 'react'
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
  const [peers, setPeers] = useState<SimplePeer.Instance[]>([])

  socket.emit('connectSS', socket.id)

  const openModal = () => setModalOpen(true)
  const closeModal = () => setModalOpen(false)

  useEffect(() => {
    // If the selectedStream is updated, this code will run only if videoRef.current is valid, and no stream is already playing (.srcObject === null)
    if(selectedStream && videoRef.current && videoRef.current.srcObject === null) {
      videoRef.current.srcObject = selectedStream
      if(isSharing === 1) {
        socket.emit('initiateSharing', socket.id)
      }
    }

    // Server sends this in the case that a client joins after peer-peer connections are already formed
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

    // Clean up socket listeners whenever component unmounts
    return () => {
      socket.removeAllListeners()
    }

    // Component will re-render any time "selectedStream" or "peers" is changed
    // selectedStream: Should only change when either the initiator begins a stream, or a receiver connects to a stream
    // peers: Should only change whenever a new peer is created and added
  }, [selectedStream, peers])


  const handleShareEnded = () => {
    if(videoRef.current) {
      videoRef.current.srcObject = null
    }
    cleanup()
  }

  const cleanup = () => {
    socket.removeAllListeners()
    const temp = peers;
    while(temp.length > 0) {
      console.log("destroying peer")
      const peer = temp.pop()
      peer?.removeAllListeners()
      peer?.destroy()
    }
    setPeers([])
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
      setPeers((newPeers) => [...newPeers, newPeerInstance])
      return newPeerInstance
    }
    else {
      const newPeerInstance = new SimplePeer()
      setPeers((newPeers) => [...newPeers, newPeerInstance])
      console.log(peers)
      return newPeerInstance
    }
  }

  const initiateSharing = async (receiver_id : string) => {
      const newPeer = await createPeer(true)
      attachInitiatorEvents(newPeer, receiver_id)
  }


  // Events that are associated with the initiator
  const attachInitiatorEvents = (peer : SimplePeer.Instance, receiver_id : string) => {
    peer.on('signal', (data) => {
      // Socket to send offer to receiver
      console.log("emitting offer to", receiver_id)
      socket.emit('offer', data, receiver_id)
    })
    peer.on('close', () => {
      // Code to run when connection is closed by a receiver
      console.log("A receiver has closed a connection")
      // Update the list of peers to remove the broken peer connections
      setPeers((prevPeers) => prevPeers.filter((p) => p !== peer));
      // Fully close said broken peer connections
      peer.removeAllListeners()
      peer.destroy()
    })
  }

  const attachReceiverEvents = (peer : SimplePeer.Instance) => {
    peer.on('signal', (data) => {
      // Socket to send answer to initiator
      socket.emit('answer', data)
    })
    peer.on('close', () => {
      // Code to run when connection is closed
      console.log("Connection has been lost")
      peer.removeAllListeners()
      peer.destroy()
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
        const newPeer = await createPeer(false)
        attachReceiverEvents(newPeer)
        newPeer.signal(data)
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
