import { NextRequest } from "next/server"

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface RouteTestOptions {
  method: HttpMethod
  path: string
  body?: unknown
  headers?: Record<string, string>
  searchParams?: Record<string, string>
  authUserId?: string
  authRole?: string
}

export function createNextReq(opts: RouteTestOptions): NextRequest {
  const url = new URL(`http://localhost:3000${opts.path}`)
  if (opts.searchParams) {
    Object.entries(opts.searchParams).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const headers = new Headers({
    "content-type": "application/json",
    ...(opts.headers ?? {}),
  })

  if (opts.authUserId) {
    headers.set("x-test-auth-user-id", opts.authUserId)
    headers.set("x-test-auth-role", opts.authRole ?? "BUYER")
  }

  const init: RequestInit & { headers: Headers } = { method: opts.method, headers }

  if (opts.body !== undefined) {
    init.body = JSON.stringify(opts.body)
  }

  return new NextRequest(url.toString(), init)
}

export async function parseResponse(res: Response) {
  const text = await res.text()
  try {
    return { status: res.status, ok: res.ok, data: JSON.parse(text) }
  } catch {
    return { status: res.status, ok: res.ok, data: text }
  }
}

export function expectPaginated(data: unknown) {
  const obj = data as any
  expect(obj).toHaveProperty("data")
  expect(obj).toHaveProperty("total")
  expect(obj).toHaveProperty("page")
  expect(obj).toHaveProperty("limit")
  expect(typeof obj.total).toBe("number")
  expect(typeof obj.page).toBe("number")
  expect(typeof obj.limit).toBe("number")
  expect(Array.isArray(obj.data)).toBe(true)
}

export function expectErrorResponse(data: unknown, status: number, messageContains?: string) {
  const obj = data as any
  expect(obj).toHaveProperty("error")
  if (messageContains) {
    expect(String(obj.error)).toContain(messageContains)
  }
}
