import { Server, Socket } from "socket.io"

let _io: Server

export function getIO(): Server {
  if (!_io) {
    throw new Error("Socket.io server not initialized")
  }
  return _io
}

function authMiddleware(socket: Socket, next: (err?: Error) => void) {
  const userId = socket.handshake.auth?.token
  if (!userId || typeof userId !== "string") {
    return next(new Error("User ID required"))
  }
  socket.data.userId = userId
  next()
}

function handleMessages(socket: Socket) {
  socket.on("join", (room: string) => {
    socket.join(room)
  })

  socket.on("leave", (room: string) => {
    socket.leave(room)
  })

  socket.on("typing", (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit("typing", {
      userId: socket.data.userId,
    })
  })
}

function handleNotifications(socket: Socket) {
  const userId = socket.data.userId
  if (userId) {
    socket.join(`user:${userId}`)
  }
}

function handleListings(socket: Socket) {
  socket.on("watch", (listingId: string) => {
    socket.join(`listing:${listingId}`)
  })

  socket.on("unwatch", (listingId: string) => {
    socket.leave(`listing:${listingId}`)
  })
}

export function initSocketServer(io: Server): void {
  _io = io

  io.of("/messages")
    .use(authMiddleware)
    .on("connection", handleMessages)

  io.of("/notifications")
    .use(authMiddleware)
    .on("connection", handleNotifications)

  io.of("/listings")
    .on("connection", handleListings)

  console.log("[socket] namespaces initialized: /messages, /notifications, /listings")
}
