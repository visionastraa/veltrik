import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket
  socket = io({
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  })
  socket.on("connect_error", (err) => {
    console.warn("[socket] connect_error:", err.message)
  })
  return socket
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
}

export function getSocket(): Socket | null {
  return socket
}
