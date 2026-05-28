"use client";

import dynamic from "next/dynamic";

type LatLng = {
  lat: number;
  lng: number;
};

const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
});

export default function MapPickerModal({
  open,
  onClose,
  value,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  value: LatLng | null;
  onSave: (coords: LatLng) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Pick exact location
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <MapPicker value={value} onChange={onSave} />

        <p className="mt-4 text-sm text-slate-500">
          Click on the map or drag the marker to set the exact service location.
        </p>
      </div>
    </div>
  );
}