import { useState, useEffect, useRef, useCallback } from 'react';
import { getFallbackLiveForecastData } from '../services/api';

/**
 * Custom React Hook for managing real-time WebSocket connection to FastAPI live feed.
 * Listens for 5-second streaming updates of INSAT-3DR satellite scans,
 * Doppler radar frames, and dynamic storm cell position vectors.
 *
 * @param {string} url - WebSocket endpoint URL (default: ws://localhost:8000/ws/live-feed)
 * @returns {object} { forecastData, connectionStatus, isConnected, lastUpdated, latestStrikes, error, reconnect, sendMessage }
 */
export function useLiveWeatherSocket(url = 'ws://localhost:8000/ws/live-feed') {
  const [forecastData, setForecastData] = useState(() =>
    getFallbackLiveForecastData('National Capital Region (Delhi NCR)')
  );
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING'); // 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING'
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  const [latestStrikes, setLatestStrikes] = useState([]);
  const [error, setError] = useState(null);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const isUnmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (isUnmountedRef.current) return;

    // Clean up existing socket before opening a new one
    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch (e) {
        // ignore close errors
      }
    }

    setConnectionStatus(reconnectAttemptsRef.current > 0 ? 'RECONNECTING' : 'CONNECTING');

    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        if (isUnmountedRef.current) return;
        console.log(`[WebSocket Connected] Live weather stream established with ${url}`);
        setConnectionStatus('CONNECTED');
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Start heartbeat ping every 15 seconds
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ action: 'PING', timestamp: new Date().toISOString() }));
          }
        }, 15000);
      };

      ws.onmessage = (event) => {
        if (isUnmountedRef.current) return;
        try {
          const payload = JSON.parse(event.data);

          // Handle live weather update event or full snapshot
          if (payload.event === 'WEATHER_UPDATE' || payload.active_storm_cells) {
            setForecastData((prev) => ({
              ...prev,
              ...payload,
            }));
            setLastUpdated(payload.timestamp || new Date().toISOString());

            // If a new lightning strike was detected in this frame, append to strike buffer
            if (payload.latest_strike) {
              setLatestStrikes((prevStrikes) => [
                payload.latest_strike,
                ...prevStrikes.slice(0, 49),
              ]);
            }
          }
        } catch (err) {
          console.warn('[WebSocket Parse Error]:', err.message);
        }
      };

      ws.onerror = (evt) => {
        if (isUnmountedRef.current) return;
        console.warn('[WebSocket Error]: Live feed socket error, preparing to reconnect...');
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        if (isUnmountedRef.current) return;
        setConnectionStatus('DISCONNECTED');

        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        // Exponential backoff reconnect: min 2s, max 15s
        const backoffMs = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 15000);
        reconnectAttemptsRef.current += 1;

        console.log(`[WebSocket Reconnect] Reconnecting in ${(backoffMs / 1000).toFixed(1)}s (attempt ${reconnectAttemptsRef.current})...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, backoffMs);
      };
    } catch (err) {
      console.warn('[WebSocket Exception]:', err.message);
      setConnectionStatus('DISCONNECTED');
      setError(err.message);
    }
  }, [url]);

  const sendMessage = useCallback((msg) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = typeof msg === 'string' ? msg : JSON.stringify(msg);
      socketRef.current.send(payload);
      return true;
    }
    return false;
  }, []);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  useEffect(() => {
    isUnmountedRef.current = false;
    connect();

    return () => {
      isUnmountedRef.current = true;
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  return {
    forecastData,
    connectionStatus,
    isConnected: connectionStatus === 'CONNECTED',
    lastUpdated,
    latestStrikes,
    error,
    reconnect,
    sendMessage,
  };
}

export default useLiveWeatherSocket;
