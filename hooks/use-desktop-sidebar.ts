import { create } from 'zustand'

type DesktopSidebarStore = {
    isCollapsed: boolean
    toggleCollapse: () => void
}

export const useDesktopSidebar = create<DesktopSidebarStore>((set) => ({
    isCollapsed: false,
    toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}))
