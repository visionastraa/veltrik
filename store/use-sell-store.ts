import { create } from 'zustand'

export interface SellFormData {
  make: string
  model: string
  variant: string
  vehicleNumber: string
  year: number
  kmDriven: number
  expectedPrice: number
  description: string
  warrantyStatus: string
  photos: string[]
  selectedDate: string
  selectedSlot: string
}

interface SellStore {
  formData: SellFormData
  setFormData: (data: Partial<SellFormData>) => void
  reset: () => void
}

const defaultData: SellFormData = {
  make: '',
  model: '',
  variant: '',
  vehicleNumber: '',
  year: new Date().getFullYear(),
  kmDriven: 0,
  expectedPrice: 0,
  description: '',
  warrantyStatus: '',
  photos: [],
  selectedDate: '',
  selectedSlot: '',
}

export const useSellStore = create<SellStore>((set) => ({
  formData: { ...defaultData },
  setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  reset: () => set({ formData: { ...defaultData } }),
}))
