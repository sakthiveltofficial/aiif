import { create } from 'zustand';

export const useNavbarStore = create((set, get) => ({
  isModalOpen: false,
  isDesktopMenuOpen: false,
  scrollPosition: 0,
  currentPath: '',
  setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  setIsDesktopMenuOpen: (isOpen) => set({ isDesktopMenuOpen: isOpen }),
  setCurrentPath: (path) => set({ currentPath: path }),
  setScrollPosition: (position) => {
    set({ scrollPosition: position });
    const { currentPath } = get();
    const isHomePage = currentPath === '/' || currentPath === '';
    
    // Only apply scroll-based opening on home page
    if (isHomePage && position >= 38 && !get().isDesktopMenuOpen) {
      set({ isDesktopMenuOpen: true });
    }
  },
  // New function to handle page-based menu state
  handlePageChange: (pathname) => {
    const isHomePage = pathname === '/' || pathname === '';
    set({ 
      currentPath: pathname,
      isDesktopMenuOpen: !isHomePage // Always open on non-home pages
    });
  },
}));