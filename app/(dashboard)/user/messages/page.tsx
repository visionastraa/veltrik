"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Home,
} from "lucide-react";

const conversations = [
  {
    id: "1",
    name: "Elite Auto",
    online: true,
    unread: 2,
    messages: [
      { id: "m1", text: "Hi! Thanks for your interest in the 2024 Civic.", sent: false, time: "10:30 AM" },
      { id: "m2", text: "Is it still available?", sent: true, time: "10:32 AM" },
      { id: "m3", text: "Yes! Would you like to schedule a test drive?", sent: false, time: "10:33 AM" },
    ],
    lastTime: "10:33 AM",
  },
  {
    id: "2",
    name: "Green Motors",
    online: false,
    unread: 0,
    messages: [
      { id: "m1", text: "We've received your trade-in evaluation request.", sent: false, time: "Yesterday" },
      { id: "m2", text: "Great, looking forward to the estimate.", sent: true, time: "Yesterday" },
    ],
    lastTime: "Yesterday",
  },
  {
    id: "3",
    name: "City Hyundai",
    online: true,
    unread: 1,
    messages: [
      { id: "m1", text: "Congratulations! Your financing has been approved.", sent: false, time: "9:15 AM" },
      { id: "m2", text: "That's amazing news!", sent: true, time: "9:20 AM" },
      { id: "m3", text: "Come by anytime to finalize the paperwork.", sent: false, time: "9:21 AM" },
    ],
    lastTime: "9:21 AM",
  },
  {
    id: "4",
    name: "Support Team",
    online: true,
    unread: 0,
    messages: [
      { id: "m1", text: "How can we help you today?", sent: false, time: "Mon" },
      { id: "m2", text: "I need help resetting my password.", sent: true, time: "Mon" },
    ],
    lastTime: "Mon",
  },
];

export default function MessagesPage() {
  const { data: session } = useSession();
  const [selectedId, setSelectedId] = useState(conversations[0].id);
  const [newMessage, setNewMessage] = useState("");
  const [allConversations, setAllConversations] = useState(conversations);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = allConversations.find((c) => c.id === selectedId)!;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setAllConversations((prev) =>
      prev.map((c) => {
        if (c.id !== selectedId) return c;
        return {
          ...c,
          messages: [
            ...c.messages,
            { id: `m${Date.now()}`, text: newMessage, sent: true, time: "Just now" },
          ],
          lastTime: "Just now",
        };
      })
    );
    setNewMessage("");
  };

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
                <Input placeholder="Search conversations..." className="pl-9" />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {allConversations.map((conv) => (
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
                      <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                        {conv.name.split(" ").map((w) => w[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {conv.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{conv.name}</span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{conv.lastTime}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {conv.messages[conv.messages.length - 1].text}
                    </p>
                  </div>
                  {conv.unread > 0 && (
                    <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] mt-0.5 bg-primary text-white">
                      {conv.unread}
                    </Badge>
                  )}
                </button>
              ))}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                    {selected.name.split(" ").map((w) => w[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-sm font-semibold">{selected.name}</h2>
                  <p className="text-xs text-gray-400">
                    {selected.online ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {selected.messages.map((msg) => (
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
                        <p>{msg.text}</p>
                        <p
                          className={cn(
                            "text-[10px] mt-1",
                            msg.sent ? "text-white/70" : "text-gray-400"
                          )}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                  <Smile className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1"
                />
                <Button size="icon" className="h-9 w-9 shrink-0 bg-primary hover:bg-primary-dark text-white" onClick={handleSend}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
