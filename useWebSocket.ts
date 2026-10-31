import { useState, useEffect } from 'react';
import { webSocketService, ConnectionStatus, WebSocketEventListener } from '../services/websocket';

export function useWebSocket(eventType?: string, listener?: WebSocketEventListener) {
  const [status, setStatus] = useState<ConnectionStatus>(webSocketService.getStatus());

  useEffect(() => {
    // Ensure connected on mount
    webSocketService.connect();

    const unsubscribeStatus = webSocketService.subscribeStatus((newStatus) => {
      setStatus(newStatus);
    });

    let unsubscribeEvent: (() => void) | undefined = undefined;
    if (eventType && listener) {
      unsubscribeEvent = webSocketService.subscribe(eventType, listener);
    }

    return () => {
      unsubscribeStatus();
      if (unsubscribeEvent) {
        unsubscribeEvent();
      }
    };
  }, [eventType, listener]);

  return {
    status,
    send: (type: string, data: any) => webSocketService.send(type, data),
    connect: () => webSocketService.connect(),
    disconnect: () => webSocketService.disconnect()
  };
}
