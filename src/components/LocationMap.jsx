import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function Recenter({ position }) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!position) return;
    if (isFirstRender.current) {
      map.setView(position, 16);
      isFirstRender.current = false;
    } else {
      map.setView(position, map.getZoom());
    }
  }, [map, position]);

  return null;
}

export function LocationMap({ location }) {
  const position = location && [location.latitude, location.longitude];
  return (
    <MapContainer
      center={position || [20.5937, 78.9629]}
      zoom={position ? 16 : 5}
      zoomControl={true}
      scrollWheelZoom={true}
      doubleClickZoom={true}
      touchZoom={true}
      minZoom={1}
      maxZoom={19}
      className="map"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        minZoom={1}
        maxZoom={19}
      />
      {position && <><Recenter position={position} /><Marker position={position} icon={markerIcon}><Popup>Your live location</Popup></Marker></>}
    </MapContainer>
  );
}

export { markerIcon, Recenter };
