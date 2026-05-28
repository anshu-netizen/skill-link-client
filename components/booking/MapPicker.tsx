"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

type LatLng = {
  lat: number;
  lng: number;
};

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
}); 

function ClickHandler({ onPick }: { onPick: (coords: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
}

export default function MapPicker({
  value,
  onChange,
}: {
  value: LatLng | null;
  onChange: (coords: LatLng) => void;
}) {
  const center: [number, number] = value
    ? [value.lat, value.lng]
    : [27.7172, 85.324]; // Kathmandu fallback

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-2xl">
      <MapContainer center={center} zoom={13} className="h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onPick={onChange} />

        {value && (
          <Marker
            position={[value.lat, value.lng]}
            icon={markerIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const pos = e.target.getLatLng();
                onChange({ lat: pos.lat, lng: pos.lng });
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}