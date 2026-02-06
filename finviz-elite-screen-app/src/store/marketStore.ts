import { create } from 'zustand';

interface MarketStore {
  earnings: any[];
  topMovers: any[];
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const useMarketStore = create<MarketStore>((set, get) => ({
  earnings: [],
  topMovers: [],
  connected: false,
  
  connect: () => {
    if (get().connected) return;
    
    // In dev, use port 8000. In prod, use relative or env var.
    const WS_BASE_URL = import.meta.env.WS_BASE_URL || 'ws://localhost:8000';
    const socket = new WebSocket(`${WS_BASE_URL}/ws`);
    
    socket.onopen = () => {
      console.log('WebSocket Connected');
      set({ connected: true });
    };
    
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'EARNINGS_UPDATE') {
          set({ earnings: message.data });
        } else if (message.type === 'MOVERS_UPDATE') {
          set({ topMovers: message.data });
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    socket.onclose = () => {
      console.log('WebSocket Disconnected');
      set({ connected: false });
      // Reconnect logic
      setTimeout(() => get().connect(), 5000);
    };
  },
  
  disconnect: () => {
      // Implement clean disconnect if stored ref to socket
  }
}));
