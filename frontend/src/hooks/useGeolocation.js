import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom React Hook for Live High-Precision Browser GPS Geolocation
 */
export function useGeolocation(options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const watchIdRef = useRef(null);

  // Success handler
  const handleSuccess = useCallback((position) => {
    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
    });
    setError(null);
    setIsLocating(false);
  }, []);

  // Error handler
  const handleError = useCallback((err) => {
    let message = 'An unknown GPS error occurred.';
    switch (err.code) {
      case 1: // PERMISSION_DENIED
        message = 'Location access denied. Please enable GPS permissions.';
        break;
      case 2: // POSITION_UNAVAILABLE
        message = 'GPS position unavailable. Check device sensors.';
        break;
      case 3: // TIMEOUT
        message = 'GPS request timed out.';
        break;
      default:
        message = err.message || message;
    }
    setError(message);
    setIsLocating(false);
  }, []);

  // Start continuous GPS tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setIsLocating(true);
    setIsTracking(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );
  }, [handleSuccess, handleError, options]);

  // Stop continuous GPS tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setIsLocating(false);
  }, []);

  // Toggle GPS tracking
  const toggleTracking = useCallback(() => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  }, [isTracking, startTracking, stopTracking]);

  // Get one-time location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      options
    );
  }, [handleSuccess, handleError, options]);

  // Cleanup watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    location,
    error,
    isTracking,
    isLocating,
    startTracking,
    stopTracking,
    toggleTracking,
    getCurrentLocation,
  };
}
