import express from "express"
import { createServer } from "http"
import next from "next"
import { Server } from "socket.io"
import { initSocketServer } from "@/lib/socket-server"

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()
const port = Number(process.env.PORT) || 3000
const socketPort = Number(process.env.SOCKET_PORT) || 3001

app.prepare().then(() => {
  const expressApp = express()

  if (process.env.NODE_ENV === "production") {
    expressApp.set("trust proxy", 1)
  }

  expressApp.get("/health", (_req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() })
  })

  const httpServer = createServer(expressApp)
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  })

  initSocketServer(io)

  expressApp.post("/emit", express.json(), (req, res) => {
    const { type, userId, listingId, conversationId, event, data } = req.body

    try {
      const notif = io.of("/notifications")
      const list = io.of("/listings")
      const msg = io.of("/messages")

      switch (type) {
        case "user":
          notif.to(`user:${userId}`).emit(event, data)
          break
        case "listing":
          list.to(`listing:${listingId}`).emit(event, data)
          break
        case "conversation":
          msg.to(`conversation:${conversationId}`).emit(event, data)
          break
        default:
          return res.status(400).json({ ok: false, error: "Unknown emit type" })
      }

      res.json({ ok: true })
    } catch (err) {
      console.error("[emit] error:", err)
      res.status(500).json({ ok: false, error: "Emit failed" })
    }
  })

  expressApp.use((req, res) => {
    return handle(req, res)
  })

  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost"

  httpServer.listen(socketPort, host, () => {
    console.log(`> Socket.io server ready on http://${host}:${socketPort}`)
  })

  expressApp.listen(port, host, () => {
    console.log(`> Next.js ready on http://${host}:${port}`)
  })
})
