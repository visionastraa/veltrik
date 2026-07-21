const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:3001"

interface EmitResponse {
  ok: boolean
}

async function postEmit(body: Record<string, unknown>): Promise<void> {
  try {
    const res = await fetch(`${SOCKET_URL}/emit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.warn("[socket-emitter] emit failed:", res.status)
    }
  } catch (err) {
    console.warn("[socket-emitter] emit error:", err)
  }
}

export async function emitToUser(userId: string, event: string, data: unknown): Promise<void> {
  await postEmit({ type: "user", userId, event, data })
}

export async function emitToListing(listingId: string, event: string, data: unknown): Promise<void> {
  await postEmit({ type: "listing", listingId, event, data })
}

export async function emitToConversation(conversationId: string, event: string, data: unknown): Promise<void> {
  await postEmit({ type: "conversation", conversationId, event, data })
}
