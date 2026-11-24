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
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];
const TIEMPO_POR_INTENTO = 9000;

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

async function pedirJson(url, opciones, signal) {
  const intento = new AbortController();
  const abortarExterno = () => intento.abort();
  signal.addEventListener('abort', abortarExterno, { once: true });
  const temporizador = setTimeout(() => intento.abort(), TIEMPO_POR_INTENTO);

  try {
    const respuesta = await fetch(url, { ...opciones, signal: intento.signal });
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    return await respuesta.json();
  } finally {
    clearTimeout(temporizador);
    signal.removeEventListener('abort', abortarExterno);
  }
}

async function consultarOverpass(lat, lng, signal) {
  const query = `[out:json][timeout:25];(node["amenity"="veterinary"](around:${RADIO_METROS},${lat},${lng});way["amenity"="veterinary"](around:${RADIO_METROS},${lat},${lng});relation["amenity"="veterinary"](around:${RADIO_METROS},${lat},${lng}););out center tags;`;
  let ultimoError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    if (signal.aborted) break;
    try {
      const data = await pedirJson(
        endpoint,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(query)}`,
        },
        signal
      );
      return data.elements || [];
    } catch (error) {
      if (signal.aborted) break;
      ultimoError = error;
    }
  }

  throw ultimoError || new Error('Overpass no respondió');
}

async function consultarNominatim(lat, lng, signal) {
  const delta = 0.06;
  const viewbox = `${lng - delta},${lat + delta},${lng + delta},${lat - delta}`;
  const url =
    'https://nominatim.openstreetmap.org/search' +
    `?format=jsonv2&addressdetails=1&limit=30&q=veterinaria&bounded=1&viewbox=${viewbox}`;
  const resultados = await pedirJson(url, { headers: { Accept: 'application/json' } }, signal);
  return Array.isArray(resultados) ? resultados : [];
}

function mapearOverpass(elementos, lat, lng) {
  const vistas = new Set();
  return elementos
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
        abierto: el.tags?.opening_hours ? !/closed/i.test(el.tags.opening_hours) : null,
        horario: el.tags?.opening_hours || '',
        distanciaKm: distanciaKm(lat, lng, elLat, elLng),
      };
    })
    .filter(Boolean)
    .filter((c) => c.distanciaKm <= RADIO_METROS / 1000 + 0.5)
    .sort((a, b) => a.distanciaKm - b.distanciaKm)
    .map((c) => ({ ...c, distancia: `${c.distanciaKm.toFixed(1)} km` }));
}

function mapearNominatim(resultados, lat, lng) {
  const vistas = new Set();
  return resultados
    .map((r) => {
      const elLat = Number(r.lat);
      const elLng = Number(r.lon);
      if (!Number.isFinite(elLat) || !Number.isFinite(elLng)) return null;
      const clave = `${elLat.toFixed(5)},${elLng.toFixed(5)}`;
      if (vistas.has(clave)) return null;
      vistas.add(clave);
      const distancia = distanciaKm(lat, lng, elLat, elLng);
      if (distancia > RADIO_METROS / 1000 + 0.5) return null;
      return {
        id: `nominatim-${r.osm_type || 'n'}-${r.osm_id || r.place_id}`,
        nombre: r.name || (r.display_name || 'Veterinaria').split(',')[0],
        lat: elLat,
        lng: elLng,
        direccion: r.display_name || 'Dirección no disponible',
        telefono: 'Teléfono no disponible',
        abierto: null,
        horario: '',
        distanciaKm: distancia,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distanciaKm - b.distanciaKm)
    .map((c) => ({ ...c, distancia: `${c.distanciaKm.toFixed(1)} km` }));
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
      (error) => {
        setAvisoUbicacion(
          error?.code === 1
            ? 'Permiso de ubicación denegado: mostrando CDMX. Toca el mapa para ajustar el punto.'
            : 'No se pudo obtener tu ubicación a tiempo: mostrando CDMX. Toca el mapa para ajustar el punto.'
        );
        setGpsListo(true);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  const fetchVets = useCallback(async (lat, lng) => {
    setIsSearching(true);
    setErrorMsg(null);

    if (peticionRef.current) peticionRef.current.abort();
    const controller = new AbortController();
    peticionRef.current = controller;

    try {
      let encontradas = [];
      let fuente = 'overpass';

      try {
        const elementos = await consultarOverpass(lat, lng, controller.signal);
        encontradas = mapearOverpass(elementos, lat, lng);
      } catch (error) {
        if (controller.signal.aborted) throw error;
        console.warn('Overpass no disponible, probando Nominatim:', error.message);
      }

      if (encontradas.length === 0 && !controller.signal.aborted) {
        try {
          const resultados = await consultarNominatim(lat, lng, controller.signal);
          encontradas = mapearNominatim(resultados, lat, lng);
          fuente = 'nominatim';
        } catch (error) {
          if (controller.signal.aborted) throw error;
          console.warn('Nominatim no disponible:', error.message);
        }
      }

      if (encontradas.length > 0) {
        setClinicas(encontradas);
        setUsandoRespaldo(false);
        setErrorMsg(
          fuente === 'nominatim'
            ? 'Resultados de OpenStreetMap sin horarios ni teléfonos. Confirma antes de acudir.'
            : null
        );
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

      {avisoUbicacion && (
        <div className="location-warning">
          <MapPinOff size={16} /> {avisoUbicacion}
        </div>
      )}

      {errorMsg && (
        <div className="location-warning">
          <MapPinOff size={16} /> {errorMsg}
        </div>
      )}

      <MapWidget
        userPosition={userPosition}
        clinicas={clinicas}
        onPickLocation={(punto) => {
          setLocation(punto);
          setAvisoUbicacion('Ubicación ajustada manualmente en el mapa.');
        }}
      />
      <p className="map-hint">Toca el mapa para ajustar la ubicación de búsqueda.</p>

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
