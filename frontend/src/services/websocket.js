/**
 * WebSocket client for real-time nowcasting streams and emergency warnings
 */
export class NowcastWebSocketClient {
  constructor(url = 'ws://localhost:8000/ws/live-feed') {
    this.url = url;
    this.ws = null;
    this.listeners = [];
    this.reconnectTimeout = null;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected to live nowcasting stream');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notify(data);
        } catch (err) {
          console.error('[WebSocket] Parsing error:', err);
        }
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Connection closed, scheduling reconnect...');
        this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
      };

      this.ws.onerror = (err) => {
        console.warn('[WebSocket] Encountered connection error');
      };
    } catch (e) {
      console.warn('[WebSocket] Init failed:', e.message);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify(data) {
    this.listeners.forEach((listener) => listener(data));
  }

  send(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) this.ws.close();
  }
}

export const wsClient = new NowcastWebSocketClient();
