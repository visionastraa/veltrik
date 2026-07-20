"use client"

import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export interface MessageData {
  id: string
  content: string
  senderId: string
  createdAt: string
  read: boolean
}

interface MessageThreadProps {
  messages: MessageData[]
  currentUserId: string
}

export function MessageThread({ messages, currentUserId }: MessageThreadProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        No messages yet. Start the conversation!
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      <AnimatePresence initial={false}>
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", isMine ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-3.5 py-2 text-sm",
                  isMine
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-gray-100 text-gray-900 rounded-bl-md"
                )}
              >
                <p>{msg.content}</p>
                <p
                  className={cn(
                    "text-[10px] mt-1",
                    isMine ? "text-white/70" : "text-gray-400"
                  )}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
      <div ref={endRef} />
    </div>
  )
}
