import { create } from "zustand"

type MobileSidebarStore = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

//This export function immediately exports an object
export const useMobileSidebar = create<MobileSidebarStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
