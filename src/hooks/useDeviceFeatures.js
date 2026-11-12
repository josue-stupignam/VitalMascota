import { useState, useEffect, useCallback } from 'react';

/**
 * Hook que gestiona permisos de dispositivo móvil:
 * - Notificaciones Push nativas
 * - Geolocalización (lat/lng)
 */
export default function useDeviceFeatures() {
  // ── Estado de geolocalización ──────────────────────────────────────
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    error: null,
    loading: false,
  });

  // ── Estado de notificaciones ───────────────────────────────────────
  const [notifications, setNotifications] = useState({
    permission: 'default',
    supported: false,
  });

  // Detectar soporte de notificaciones al montar
  useEffect(() => {
    const supported = 'Notification' in window;
    setNotifications({
      permission: supported ? Notification.permission : 'denied',
      supported,
    });
  }, []);

  // ── Solicitar permiso de notificaciones ────────────────────────────
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      setNotifications({ permission: 'denied', supported: false });
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setNotifications({ permission: result, supported: true });

      if (result === 'granted') {
        new Notification('VitalMascota 🐾', {
          body: '¡Notificaciones activadas! Te avisaremos de citas y recordatorios.',
          icon: '/icons/icon-192x192.png',
        });
      }
      return result;
    } catch (err) {
      console.error('Error solicitando permiso de notificaciones:', err);
      return 'denied';
    }
  }, []);

  // ── Solicitar geolocalización ──────────────────────────────────────
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation({
        lat: null,
        lng: null,
        error: 'Geolocalización no soportada en este navegador',
        loading: false,
      });
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (err) => {
        // Fallback: coordenadas de CDMX
        setLocation({
          lat: 19.345,
          lng: -99.19,
          error: `Usando ubicación aproximada: ${err.message}`,
          loading: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 min de caché
      }
    );
  }, []);

  return {
    location,
    notifications,
    requestNotificationPermission,
    requestLocation,
  };
}
