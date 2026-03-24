import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Target, Layers } from 'lucide-react';
import './GeofenceSetup.css';

// Fix for Leaflet default icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const GeofenceSetup = ({ onUpdate, initialValue }) => {
  const [position, setPosition] = useState(initialValue?.lat ? [initialValue.lat, initialValue.lng] : [12.9716, 77.5946]);
  const [radius, setRadius] = useState(initialValue?.radius || 100);

  // Map click handler
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onUpdate({ 
          lat: e.latlng.lat, 
          lng: e.latlng.lng, 
          radius: radius 
        });
      },
    });
    return null;
  };

  const handleRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value);
    setRadius(newRadius);
    onUpdate({ 
      lat: position[0], 
      lng: position[1], 
      radius: newRadius 
    });
  };

  return (
    <div className="geofence-setup-wrapper">
      <div className="setup-controls">
        <div className="control-item">
          <label>
            <Target size={16} /> Allowed Radius: <strong>{radius}m</strong>
          </label>
          <input 
            type="range" 
            min="10" 
            max="1000" 
            step="10"
            value={radius} 
            onChange={handleRadiusChange}
            className="radius-slider"
          />
        </div>
        <div className="location-info">
          <div className="info-badge">
             <MapPin size={14} /> {position[0].toFixed(5)}, {position[1].toFixed(5)}
          </div>
          <p className="instruction-text">Click on the map to drop the event venue pin.</p>
        </div>
      </div>

      <div className="map-container-pwa">
        <MapContainer 
          center={position} 
          zoom={15} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler />
          <Marker position={position}>
          </Marker>
          <Circle 
            center={position} 
            radius={radius} 
            pathOptions={{ 
              color: '#7c3aed', 
              fillColor: '#7c3aed', 
              fillOpacity: 0.2,
              weight: 2
            }} 
          />
        </MapContainer>
      </div>
    </div>
  );
};

export default GeofenceSetup;
