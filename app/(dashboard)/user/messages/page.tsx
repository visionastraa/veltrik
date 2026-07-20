"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Search, Send, ArrowLeft, Home, Loader2, MessageSquare
} from "lucide-react"
import { useSocket } from "@/components/socket-provider"

function fetchConversations(): Promise<{ success: boolean; data: any[] }> {
  return fetch("/api/messages/conversations").then((r) => r.json())
}

function fetchConversation(id: string): Promise<{ success: boolean; data: any }> {
  return fetch(`/api/messages/conversations/${id}`).then((r) => r.json())
}

function sendMessage(id: string, content: string) {
  return fetch(`/api/messages/conversations/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  }).then((r) => r.json())
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  const { socket } = useSocket()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [search, setSearch] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: convData, isLoading: convsLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  })

  const { data: chatData, isLoading: chatLoading } = useQuery({
    queryKey: ["conversation", selectedId],
    queryFn: () => fetchConversation(selectedId!),
    enabled: !!selectedId,
  })

  const sendMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => sendMessage(id, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversation", selectedId] })
      qc.invalidateQueries({ queryKey: ["conversations"] })
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatData])

  const conversations = (convData?.data ?? []).filter((c: any) =>
    c.otherUser?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.listingTitle?.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id)
    }
  }, [conversations, selectedId])

  useEffect(() => {
    if (!selectedId || !socket) return

    socket.emit("join", `conversation:${selectedId}`)

    const handler = (msg: any) => {
      qc.setQueryData(["conversation", selectedId], (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: {
            ...old.data,
            messages: [...(old.data.messages || []), msg],
          },
        }
      })
      qc.invalidateQueries({ queryKey: ["conversations"] })
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    }

    socket.on("message:new", handler)
    return () => {
      socket.off("message:new", handler)
      socket.emit("leave", `conversation:${selectedId}`)
    }
  }, [selectedId, socket])

  const selected = chatData?.data

  const handleSend = () => {
    if (!newMessage.trim() || !selectedId) return
    sendMutation.mutate({ id: selectedId, content: newMessage })
    setNewMessage("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/user">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-0.5">
              <Link href="/user" className="hover:text-primary transition-colors flex items-center gap-1">
                <Home className="w-3 h-3" />
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Messages</span>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-10rem)] overflow-hidden rounded-xl border-0 shadow-sm bg-white">
          {/* Conversation List */}
          <div className="w-80 flex-shrink-0 border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <h1 className="text-lg font-semibold mb-3">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {convsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv: any) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-gray-50",
                      selectedId === conv.id && "bg-primary/5"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.otherUser?.image} />
                        <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                          {conv.otherUser?.name?.split(" ").map((w: string) => w[0]).join("") || "?"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{conv.otherUser?.name || "Unknown"}</span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {conv.lastMessage || (conv.listingTitle ? `Re: ${conv.listingTitle}` : "No messages yet")}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] mt-0.5 bg-primary text-white">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </button>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3" />
                  <p>Select a conversation</p>
                </div>
              </div>
            ) : chatLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={selected.otherUser?.image} />
                      <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                        {selected.otherUser?.name?.split(" ").map((w: string) => w[0]).join("") || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-sm font-semibold">{selected.otherUser?.name}</h2>
                      {selected.subject && <p className="text-xs text-gray-400">{selected.subject}</p>}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {selected.messages?.map((msg: any) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn("flex", msg.sent ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] rounded-2xl px-3.5 py-2 text-sm",
                              msg.sent
                                ? "bg-primary text-white rounded-br-md"
                                : "bg-gray-100 text-gray-900 rounded-bl-md"
                            )}
                          >
                            <p>{msg.content}</p>
                            <p className={cn("text-[10px] mt-1", msg.sent ? "text-white/70" : "text-gray-400")}>
                              {new Date(msg.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {sendMutation.isPending && (
                      <div className="flex justify-end">
                        <div className="max-w-[70%] rounded-2xl rounded-br-md px-3.5 py-2 text-sm bg-primary/50 text-white">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !sendMutation.isPending && handleSend()}
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      className="h-9 w-9 shrink-0 bg-primary hover:bg-primary-dark text-white"
                      onClick={handleSend}
                      disabled={sendMutation.isPending || !newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
