import { create } from 'zustand';

export const useArtistStore = create((set) => ({
  searchQuery: '',
  selectedArtist: null,
  platform: 'spotify',
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedArtist: (artist) => set({ selectedArtist: artist }),
  setPlatform: (platform) => set({ platform }),
  
  clearArtist: () => set({ selectedArtist: null }),
}));