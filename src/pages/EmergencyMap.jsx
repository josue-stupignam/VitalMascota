import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import MapWidget from '../components/map/MapWidget';
import ClinicCard from '../components/map/ClinicCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import '../styles/map.css';

export default function EmergencyMap() {
  const [clinicas, setClinicas] = useState([]);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // ── Obtener ubicación real del dispositivo ──────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocalización no soportada por tu navegador.');
      setLocation({ lat: 19.4326, lng: -99.1332 });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setErrorMsg('No se pudo obtener la ubicación. Mostrando CDMX por defecto.');
        setLocation({ lat: 19.4326, lng: -99.1332 });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // ── Fetch a Overpass API via POST (evita CORS por URL larga) ───
  const fetchVets = async (lat, lng) => {
    setIsSearching(true);
    try {
      const query = `[out:json][timeout:25];(node["amenity"="veterinary"](around:5000,${lat},${lng});way["amenity"="veterinary"](around:5000,${lat},${lng});relation["amenity"="veterinary"](around:5000,${lat},${lng}););out center;`;
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });
      const data = await response.json();

      const mappedVets = data.elements.map(el => ({
        id: el.id,
        nombre: el.tags.name || 'Veterinaria sin nombre',
        lat: el.lat || el.center.lat,
        lng: el.lon || el.center.lon,
        direccion: el.tags['addr:street']
          ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}`
          : 'Dirección no disponible',
        telefono: el.tags.phone || 'Teléfono no disponible',
        abierto: true,
        horario: el.tags.opening_hours || 'Horario no especificado',
      }));
      setClinicas(mappedVets);
    } catch (error) {
      console.error('Error buscando veterinarias:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (location.lat && location.lng) {
      fetchVets(location.lat, location.lng);
    }
  }, [location.lat, location.lng]);

  // ── Pantalla de carga GPS ──────────────────────────────────────
  if (loading) {
    return <LoadingSpinner message="Buscando tu ubicación..." />;
  }

  const userPosition = [location.lat, location.lng];

  return (
    <main className="page">
      <PageHeader
        title="Emergencia"
        subtitle="Veterinarias cercanas a tu ubicación"
        icon="🚨"
      />

      {errorMsg && (
        <div className="location-warning">
          <span>📍</span> {errorMsg}
        </div>
      )}

      <MapWidget userPosition={userPosition} clinicas={clinicas} />

      <div className="clinic-list">
        <h3 className="section-title">Clínicas disponibles en un radio de 5km</h3>
        {isSearching ? (
          <p className="empty-state">Buscando clínicas a 5km...</p>
        ) : clinicas.length === 0 ? (
          <p className="empty-state">No se encontraron clínicas veterinarias en este rango.</p>
        ) : (
          clinicas.map((c) => (
            <ClinicCard key={c.id} clinica={c} />
          ))
        )}
      </div>
    </main>
  );
}