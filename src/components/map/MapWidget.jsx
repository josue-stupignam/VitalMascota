import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/map.css';

// Fix Leaflet default icon paths in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom user location dot
const userIcon = L.divIcon({
  className: 'user-marker-dot',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Custom clinic pin
const clinicIcon = L.divIcon({
  className: 'clinic-marker-pin',
  html: '🏥',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

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

        {/* User position */}
        <Marker position={userPosition} icon={userIcon}>
          <Popup>Tu ubicación actual</Popup>
        </Marker>

        {/* Veterinary clinics */}
        {clinicas.map((c) => (
          <Marker key={c.id} position={[c.lat, c.lng]} icon={clinicIcon}>
            <Popup className="clinic-popup">
              <div>
                <strong>{c.nombre}</strong>
                <p>{c.direccion}</p>
                {c.telefono && <p>📞 {c.telefono}</p>}
                <span className={`clinic-status ${c.abierto ? 'open' : 'closed'}`}>
                  {c.abierto ? 'Abierto' : 'Cerrado'}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
