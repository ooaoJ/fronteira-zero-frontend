import { io } from 'socket.io-client'

let socket = null

function getWsUrl() {
  return import.meta.env.VITE_API_URL
}

export function getSocket() {
  if (socket) return socket

  const token = localStorage.getItem('fz_token')

  socket = io(getWsUrl(), {
    transports: ['websocket'],
    auth: token ? { token } : {},
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}