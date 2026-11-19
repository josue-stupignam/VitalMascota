import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/map.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = L.divIcon({
  className: 'user-marker-dot',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const clinicIcon = L.divIcon({
  className: 'clinic-marker-pin',
  html: '<span class="clinic-pin-glyph"></span>',
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  popupAnchor: [0, -26],
});

function MapController({ userPosition }) {
  const map = useMap();

  useEffect(() => {
    const temporizador = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(temporizador);
  }, [map]);

  useEffect(() => {
    if (userPosition?.[0] && userPosition?.[1]) {
      map.setView(userPosition, map.getZoom(), { animate: true });
    }
  }, [map, userPosition]);

  return null;
}

export default function MapWidget({ userPosition, clinicas = [] }) {
  if (!userPosition || !userPosition[0] || !userPosition[1]) return null;

  return (
    <div className="map-wrapper">
      <MapContainer
        center={userPosition}
        zoom={14}
        scrollWheelZoom={false}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController userPosition={userPosition} />

        <Marker position={userPosition} icon={userIcon}>
          <Popup>Tu ubicación actual</Popup>
        </Marker>

        {clinicas.map((c) => (
          <Marker key={c.id} position={[c.lat, c.lng]} icon={clinicIcon}>
            <Popup className="clinic-popup">
              <div>
                <strong>{c.nombre}</strong>
                <p>{c.direccion}</p>
                {c.telefono && c.telefono !== 'Teléfono no disponible' && (
                  <p>{c.telefono}</p>
                )}
                <span className={`clinic-status ${c.abierto === null ? 'unknown' : c.abierto ? 'open' : 'closed'}`}>
                  {c.abierto === null ? 'Horario no disponible' : c.abierto ? 'Abierto' : 'Cerrado'}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
