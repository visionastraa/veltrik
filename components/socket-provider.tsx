"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useSession } from "next-auth/react"
import type { Socket } from "socket.io-client"
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket"

interface SocketContextValue {
  socket: Socket | null
  connected: boolean
}

const SocketContext = createContext<SocketContextValue>({ socket: null, connected: false })

export function useSocket() {
  return useContext(SocketContext)
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) {
      disconnectSocket()
      setConnected(false)
      return
    }

    const socket = connectSocket(session.user.id)

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    const onError = () => setConnected(false)

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("connect_error", onError)

    if (socket.connected) {
      setConnected(true)
    }

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("connect_error", onError)
    }
  }, [session?.user?.id])

  const socket = getSocket()

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}
