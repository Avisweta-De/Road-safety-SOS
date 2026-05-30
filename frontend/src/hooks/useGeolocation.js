import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_LOCATION } from '../utils/mockData';

/**
 * useGeolocation hook — GPS detection + Nominatim reverse geocoding + manual override.
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
        const parts = data.display_name.split(', ');
        return parts.slice(0, 3).join(', ');
      }
    } catch {
      // Nominatim failed
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

  // Manual location override — search by address or set coordinates
  const setManualLocation = useCallback(async (lat, lng, addr) => {
    setLoading(true);
    setError(null);
    const loc = { lat, lng, accuracy: 0, manual: true };
    setLocation(loc);
    if (addr) {
      setAddress(addr);
    } else {
      const resolved = await reverseGeocode(lat, lng);
      setAddress(resolved);
    }
    setLoading(false);
  }, []);

  // Search location by address string using Nominatim forward geocoding
  const searchLocation = useCallback(async (query) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'RoadSoS/2.0 (road-safety-app)' } }
      );
      const results = await res.json();
      return results.map(r => ({
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        display: r.display_name,
        short: r.display_name.split(', ').slice(0, 3).join(', '),
      }));
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { location, address, error, loading, requestLocation, setManualLocation, searchLocation, isDemo: error !== null };
}
