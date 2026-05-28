"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

type BookingLocationMapProps = {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
};

const customDivIcon = L.divIcon({
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #2563eb;
      border: 3px solid white;
      border-radius: 9999px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
    "></div>
  `,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function BookingLocationMap({
  lat,
  lng,
  address,
  city,
}: BookingLocationMapProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-[320px] w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={customDivIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{address || "Booking location"}</p>
              <p>{city || ""}</p>
              <p>
                {lat.toFixed(6)}, {lng.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}