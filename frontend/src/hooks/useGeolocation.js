import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_LOCATION } from '../utils/mockData';

/**
 * useGeolocation hook — GPS detection + Nominatim reverse geocoding.
 */
export default function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'RoadSoS/2.0 (road-safety-app)' } }
      );
      const data = await res.json();
      if (data.display_name) {
        // Extract short address
        const parts = data.display_name.split(', ');
        const short = parts.slice(0, 3).join(', ');
        return short;
      }
    } catch {
      // Nominatim failed — use fallback
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const requestLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLocation(DEFAULT_LOCATION);
      setAddress(DEFAULT_LOCATION.address);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setLocation(loc);
        const addr = await reverseGeocode(loc.lat, loc.lng);
        setAddress(addr);
        setLoading(false);
      },
      (err) => {
        let msg = 'Location unavailable';
        if (err.code === err.PERMISSION_DENIED) msg = 'Location access denied. Using Lucknow.';
        else if (err.code === err.POSITION_UNAVAILABLE) msg = 'Location unavailable. Using Lucknow.';
        else if (err.code === err.TIMEOUT) msg = 'Location timed out. Using Lucknow.';
        setError(msg);
        setLocation(DEFAULT_LOCATION);
        setAddress(DEFAULT_LOCATION.address);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { location, address, error, loading, requestLocation, isDemo: error !== null };
}
