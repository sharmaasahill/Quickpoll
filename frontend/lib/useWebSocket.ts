'use client';

import { useEffect, useState, useRef } from "react";

export function useWebSocket(url: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<Record<string, unknown> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    let websocket: WebSocket | null = null;

    const connect = () => {
      // Stop reconnecting after max attempts
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        setIsConnected(false);
        return;
      }

      try {
        websocket = new WebSocket(url);

        websocket.onopen = () => {
          setWs(websocket);
          setIsConnected(true);
          reconnectAttemptsRef.current = 0; // Reset on successful connection
        };

        websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastMessage(data);
          } catch {
            // Silently handle parsing errors
          }
        };

        websocket.onerror = () => {
          setIsConnected(false);
        };

        websocket.onclose = () => {
          setIsConnected(false);
          setWs(null);
          
          // Increment reconnect attempts
          reconnectAttemptsRef.current += 1;
          
          // Attempt to reconnect with exponential backoff (max 30 seconds)
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const backoffTime = Math.min(3000 * reconnectAttemptsRef.current, 30000);
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, backoffTime);
          }
        };
      } catch {
        setIsConnected(false);
        reconnectAttemptsRef.current += 1;
        
        // Retry connection with backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const backoffTime = Math.min(5000 * reconnectAttemptsRef.current, 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, backoffTime);
        }
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (websocket) {
        websocket.close();
      }
    };
  }, [url]);

  return { ws, lastMessage, isConnected };
}
