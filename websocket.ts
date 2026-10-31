import { auth } from '../lib/firebase';

export type ConnectionStatus = 'Connected' | 'Reconnecting' | 'Disconnected';

export type WebSocketEventListener = (data: any) => void;
export type StatusListener = (status: ConnectionStatus) => void;

class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = 'Disconnected';
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30000;
  private listeners: Map<string, Set<WebSocketEventListener>> = new Map();
  private statusListeners: Set<StatusListener> = new Set();
  private reconnectTimer: any = null;
  private isIntentionallyClosed = false;

  private constructor() {
    // Auto connect or graceful fallback
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public async connect(): Promise<void> {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isIntentionallyClosed = false;
    this.setStatus('Reconnecting');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      let token = '';
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken().catch(() => '');
      }

      const finalUrl = token ? `${wsUrl}?token=${encodeURIComponent(token)}` : wsUrl;
      
      let socket: WebSocket;
      try {
        socket = new WebSocket(finalUrl);
      } catch (wsErr) {
        this.setStatus('Disconnected');
        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        }
        return;
      }

      this.ws = socket;

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus('Connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { type, ...payload } = message;
          if (type && this.listeners.has(type)) {
            this.listeners.get(type)?.forEach(listener => {
              try {
                listener(payload);
              } catch (err) {
                console.error(`Error in WS listener for ${type}:`, err);
              }
            });
          }
        } catch (err) {
          // Ignore parse errors silently
        }
      };

      this.ws.onclose = () => {
        this.setStatus('Disconnected');
        this.ws = null;
        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        // Handle websocket error gracefully without unhandled rejections
        this.setStatus('Disconnected');
        if (this.ws && this.ws.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
          try {
            this.ws.close();
          } catch (e) {
            // Ignore close errors
          }
        }
      };
    } catch (err) {
      this.setStatus('Disconnected');
      this.ws = null;
      if (!this.isIntentionallyClosed) {
        this.scheduleReconnect();
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;
    this.setStatus('Reconnecting');
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  public disconnect(): void {
    this.isIntentionallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try {
        if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close();
        }
      } catch (e) {
        // Ignore
      }
      this.ws = null;
    }
    this.setStatus('Disconnected');
  }

  public subscribe(eventType: string, listener: WebSocketEventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)?.add(listener);

    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private setStatus(newStatus: ConnectionStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusListeners.forEach(listener => listener(newStatus));
    }
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public send(type: string, data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type, ...data }));
      } catch (err) {
        console.warn('Failed to send WebSocket message:', err);
      }
    } else {
      // WS not open, queue or skip gracefully
    }
  }
}

export const webSocketService = WebSocketService.getInstance();
