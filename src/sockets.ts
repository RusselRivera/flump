import { DefaultEventsMap } from '@socket.io/component-emitter';
import io, { Socket } from 'socket.io-client'

const socket = io('http://localhost:35565')

export default socket
