import React, {useState, useEffect, useRef} from 'react'
import socket from '../../sockets'
import SimplePeer from 'simple-peer'
import Source from './extra_components/Source'
import ShareScreenModal from './extra_components/ShareScreenModal'

const ScreenShare: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([])
  const [isModalOpen, setModalOpen] = useState<boolean>(false)
  const [selectedStream, setSelectedStream] = useState<MediaStream | undefined>(undefined)
  // 0 = No sharing, 1 = Sharing, 2 = someone else is sharing
  const [isSharing, setIsSharing] = useState<number>(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const peer = useRef<SimplePeer.Instance | null>(null)

  const openModal = () => setModalOpen(true)
  const closeModal = () => setModalOpen(false)

  useEffect(() => {
    if(selectedStream && videoRef.current) {
      videoRef.current.srcObject = selectedStream
      if(isSharing === 1) {
        initiatePeerConnection()
      }
    }

    socket.on('offer', (data) => {
      // Receiving remote stream
      if(isSharing !== 1) {
        setIsSharing(2)
        handleReceivedOffer(data)
      }
    })

    socket.on('answer', (data) => {
      if(isSharing === 1 && peer.current) {
        peer.current.signal(data)
      }
    })

  }, [selectedStream])

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
    videoRef.current!.srcObject = null
    setSelectedStream(undefined)
    setIsSharing(0)
  }

  const initiatePeerConnection = () => {
    peer.current = new SimplePeer({initiator: true, stream: selectedStream})

    peer.current.on('signal', (data) => {
      socket.emit('offer', data)
    })
  }

  const handleReceivedOffer = (offer : any) => {
    peer.current = new SimplePeer()

    peer.current.on('signal', (data) => {
      socket.emit('answer', data)
    })

    peer.current.on('stream', (stream) => {
      setSelectedStream(stream)
    })

    peer.current.signal(offer)
  }

  return (
    <div>
      {isSharing === 0 && (<button onClick={chooseScreen}>Share Screen</button>)}
      {isSharing === 1 && (<button onClick={stopSharing}>Stop Sharing</button>)}
      <ShareScreenModal isOpen={isModalOpen} closeModal={closeModal} sources={sources} handleSourceSelect={handleSourceSelect} />
      {selectedStream && <video ref={videoRef} autoPlay></video>}
    </div>
  )
}

export default ScreenShare
