import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { markerIcon } from './LocationMap';

const defaultCenter = [20.5937, 78.9629];
const formatTime = (timestamp) => (timestamp ? new Date(timestamp).toLocaleString() : 'Unknown');

function InitialMapController({ locations }) {
  const map = useMap();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!hasInitializedRef.current && locations && locations.length > 0) {
      const position = [Number(locations[0].latitude), Number(locations[0].longitude)];
      map.setView(position, 14);
      hasInitializedRef.current = true;
    }
  }, [map, locations]);

  return null;
}

function SelectedUserMapController({ selectedUser, markerRefs }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedUser) return undefined;

    const position = [Number(selectedUser.latitude), Number(selectedUser.longitude)];
    map.flyTo(position, 15, { duration: 0.8 });

    const marker = markerRefs.current[selectedUser.userId];
    if (marker) marker.openPopup();

    return undefined;
  }, [map, markerRefs, selectedUser]);

  return null;
}

export default function AdminDashboard({ locations, onSignOut }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const markerRefs = useRef({});
  const initialCenter = locations.length
    ? [Number(locations[0].latitude), Number(locations[0].longitude)]
    : defaultCenter;

  const selectUser = (user) => setSelectedUser(user);

  return (
    <main className="page">
      <header className="header-row">
        <div>
          <h1>Admin dashboard</h1>
          <p>{locations.length} active location{locations.length === 1 ? '' : 's'}</p>
        </div>
        <button className="secondary" onClick={onSignOut}>Sign out</button>
      </header>

      <div className="dashboard">
        <aside className="sidebar">
          <h2>Active users</h2>
          {locations.length ? locations.map((item) => (
            <button
              key={item.userId}
              className="user user-button"
              aria-pressed={selectedUser?.userId === item.userId}
              onClick={() => selectUser(item)}
            >
              <strong><i />{item.userName}</strong>
              <span>{Number(item.latitude).toFixed(6)}, {Number(item.longitude).toFixed(6)}</span>
              <small>Updated {formatTime(item.timestamp)}</small>
            </button>
          )) : <p>No one is actively sharing.</p>}
        </aside>

        <MapContainer
          center={initialCenter}
          zoom={locations.length ? 14 : 5}
          zoomControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          touchZoom={true}
          minZoom={1}
          maxZoom={19}
          className="map dashboard-map"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            minZoom={1}
            maxZoom={19}
          />
          <InitialMapController locations={locations} />
          <SelectedUserMapController selectedUser={selectedUser} markerRefs={markerRefs} />
          {locations.map((item) => (
            <Marker
              key={item.userId}
              ref={(marker) => {
                if (marker) markerRefs.current[item.userId] = marker;
                else delete markerRefs.current[item.userId];
              }}
              position={[Number(item.latitude), Number(item.longitude)]}
              icon={markerIcon}
            >
              <Popup>
                <strong>{item.userName}</strong><br />
                Latitude: {Number(item.latitude).toFixed(6)}<br />
                Longitude: {Number(item.longitude).toFixed(6)}<br />
                Updated: {formatTime(item.timestamp)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </main>
  );
}
