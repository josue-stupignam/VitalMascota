import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapPinOff, RefreshCw, Siren } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import MapWidget from '../components/map/MapWidget';
import ClinicCard from '../components/map/ClinicCard';
import { SkeletonCard } from '../components/ui/Skeleton';
import { clinicasCercanas } from '../data/mockData';
import '../styles/map.css';

const CENTRO_POR_DEFECTO = { lat: 19.4326, lng: -99.1332 };
const RADIO_METROS = 5000;

function distanciaKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function EmergencyMap() {
  const [clinicas, setClinicas] = useState([]);
  const [location, setLocation] = useState(CENTRO_POR_DEFECTO);
  const [gpsListo, setGpsListo] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [usandoRespaldo, setUsandoRespaldo] = useState(false);
  const [avisoUbicacion, setAvisoUbicacion] = useState('');
  const peticionRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setAvisoUbicacion('Geolocalización no soportada: las distancias son aproximadas.');
      setGpsListo(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsListo(true);
      },
      () => {
        setAvisoUbicacion('No se pudo obtener tu ubicación: mostrando clínicas de referencia en CDMX.');
        setGpsListo(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const fetchVets = useCallback(async (lat, lng) => {
    setIsSearching(true);
    setErrorMsg(null);

    if (peticionRef.current) peticionRef.current.abort();
    const controller = new AbortController();
    peticionRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const query = `[out:json][timeout:25];(node["amenity"="veterinary"](around:${RADIO_METROS},${lat},${lng});way["amenity"="veterinary"](around:${RADIO_METROS},${lat},${lng});relation["amenity"="veterinary"](around:${RADIO_METROS},${lat},${lng}););out center tags;`;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`Overpass respondió ${response.status}`);
      const data = await response.json();

      const vistas = new Set();
      const mapped = (data.elements || [])
        .map((el) => {
          const elLat = el.lat ?? el.center?.lat;
          const elLng = el.lon ?? el.center?.lon;
          if (!elLat || !elLng) return null;
          const clave = `${elLat.toFixed(5)},${elLng.toFixed(5)}`;
          if (vistas.has(clave)) return null;
          vistas.add(clave);
          return {
            id: `${el.type}-${el.id}`,
            nombre: el.tags?.name || 'Veterinaria sin nombre',
            lat: elLat,
            lng: elLng,
            direccion: el.tags?.['addr:street']
              ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}`.trim()
              : 'Dirección no disponible',
            telefono: el.tags?.phone || el.tags?.['contact:phone'] || 'Teléfono no disponible',
            abierto: !/closed/i.test(el.tags?.opening_hours || ''),
            horario: el.tags?.opening_hours || 'Horario no especificado',
            distanciaKm: distanciaKm(lat, lng, elLat, elLng),
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.distanciaKm - b.distanciaKm)
        .map((c) => ({ ...c, distancia: `${c.distanciaKm.toFixed(1)} km` }));

      if (mapped.length > 0) {
        setClinicas(mapped);
        setUsandoRespaldo(false);
      } else {
        setClinicas(clinicasCercanas);
        setUsandoRespaldo(true);
        setErrorMsg('No se encontraron veterinarias en 5 km. Mostrando clínicas de referencia.');
      }
    } catch (error) {
      if (error.name === 'AbortError' && peticionRef.current !== controller) return;
      console.error('Error buscando veterinarias:', error);
      setClinicas(clinicasCercanas);
      setUsandoRespaldo(true);
      setErrorMsg(
        error.name === 'AbortError'
          ? 'La búsqueda tardó demasiado. Mostrando clínicas de referencia.'
          : 'El servicio de mapas no respondió. Mostrando clínicas de referencia.'
      );
    } finally {
      clearTimeout(timeoutId);
      if (peticionRef.current === controller) peticionRef.current = null;
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (gpsListo) fetchVets(location.lat, location.lng);
  }, [gpsListo, location.lat, location.lng, fetchVets]);

  useEffect(() => () => {
    if (peticionRef.current) peticionRef.current.abort();
  }, []);

  const userPosition = useMemo(() => [location.lat, location.lng], [location]);

  return (
    <main className="page">
      <PageHeader
        title="Emergencia"
        subtitle="Veterinarias en un radio de 5 km"
        icon={<Siren size={22} />}
      />

      {avisoUbicacion && !usandoRespaldo && (
        <div className="location-warning">
          <MapPinOff size={16} /> {avisoUbicacion}
        </div>
      )}

      {errorMsg && (
        <div className="location-warning">
          <MapPinOff size={16} /> {errorMsg}
        </div>
      )}

      <MapWidget userPosition={userPosition} clinicas={clinicas} />

      <div className="clinic-list">
        <div className="clinic-list-header">
          <h3 className="section-title">
            {usandoRespaldo ? 'Clínicas de referencia' : 'Clínicas cercanas'}
          </h3>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => fetchVets(location.lat, location.lng)}
            disabled={isSearching}
          >
            <RefreshCw size={14} /> {isSearching ? 'Buscando…' : 'Actualizar'}
          </button>
        </div>

        {isSearching && clinicas.length === 0 && (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!isSearching && clinicas.length === 0 && (
          <p className="empty-state">No se encontraron clínicas veterinarias en este rango.</p>
        )}

        {clinicas.map((c) => (
          <ClinicCard key={c.id} clinica={c} />
        ))}
      </div>
    </main>
  );
}
