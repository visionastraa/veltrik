"use client"

import { create } from "zustand"

interface CompareStore {
  ids: string[]
  add: (id: string) => void
  remove: (id: string) => void
  toggle: (id: string) => void
  clear: () => void
  has: (id: string) => boolean
}

export const useCompareStore = create<CompareStore>((set, get) => ({
  ids: [],
  add: (id) => set((s) => s.ids.length >= 4 || s.ids.includes(id) ? s : { ids: [...s.ids, id] }),
  remove: (id) => set((s) => ({ ids: s.ids.filter((i) => i !== id) })),
  toggle: (id) => {
    const { ids } = get()
    if (ids.includes(id)) set({ ids: ids.filter((i) => i !== id) })
    else if (ids.length < 4) set({ ids: [...ids, id] })
  },
  clear: () => set({ ids: [] }),
  has: (id) => get().ids.includes(id),
}))
