import React from 'react'
import Modal from 'react-modal'
import Source from './Source'

interface ShareScreenModalProps {
  isOpen: boolean
  closeModal: () => void
  sources: Source[]
  handleSourceSelect: (src: Source) => void;
}

const ShareScreenModal : React.FC<ShareScreenModalProps> = ({isOpen, closeModal, sources, handleSourceSelect}) => {
  return (
    <Modal ariaHideApp={false} isOpen={isOpen} onRequestClose={closeModal}>
      <h1> Choose a Desktop Source </h1>
      <ul>
        {sources.map((source) => (
          <li key = {source.id}>
            <img src={source.thumbnailUrl} alt={source.name} />
            <p> {source.name} </p>
            <button onClick={() => handleSourceSelect(source)}>Select</button>
          </li>
        ))}
      </ul>
    </Modal>
  )
}

export default ShareScreenModal
