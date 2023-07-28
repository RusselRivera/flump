import io from 'socket.io-client'

let socket
let authtoken = window.electron.getToken()
authtoken.then((token) => {
    socket = io('http://localhost:35565', {
        query: {token}
    })
    console.log("Token: " + token)
})

export default socket;
