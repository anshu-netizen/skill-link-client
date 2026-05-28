"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, Save, ShieldCheck } from "lucide-react";
import { getToken } from "@/lib/auth";

type WorkingHoursResponse = {
  success: boolean;
  workingHours: {
    startHour: number;
    endHour: number;
  };
  availability: string;
  provider: {
    _id: string;
    fullName: string;
    role: "jobProvider" | "jobSeeker" | "admin";
  };
};

type UpdateWorkingHoursResponse = {
  success: boolean;
  message: string;
  user?: {
    _id: string;
    fullName: string;
    availability?: string;
    workingHours?: {
      startHour: number;
      endHour: number;
    };
  };
};

const startHourOptions = Array.from({ length: 24 }, (_, i) => i);
const endHourOptions = Array.from({ length: 24 }, (_, i) => i + 1);

const availabilityPresets = [
  "Available Monday to Friday. Closed on weekends.",
  "Available Monday to Saturday. Closed on Sunday.",
  "Available every day except public holidays.",
  "Available for urgent bookings. Please call before confirming.",
];

const API_BASES = Array.from(
  new Set(
    [process.env.NEXT_PUBLIC_API_URL, "http://localhost:5001/api"].filter(
      Boolean
    ) as string[]
  )
);

async function authFetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let lastMessage = "Request failed";

  for (const base of API_BASES) {
    const url = `${base.replace(/\/$/, "")}${path}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (response.ok) {
        return data as T;
      }

      lastMessage = data?.message || `Request failed with status ${response.status}`;

      // If one API base is stale/wrong, try the next base before showing the error.
      if (response.status === 404) {
        continue;
      }

      throw new Error(lastMessage);
    } catch (err) {
      if (err instanceof Error) {
        lastMessage = err.message;
      }

      // Only try the fallback base for network/404-style failures.
      if (lastMessage.toLowerCase().includes("not found")) {
        continue;
      }

      throw new Error(lastMessage);
    }
  }

  throw new Error(lastMessage);
}

function formatHourLabel(hour: number) {
  if (hour === 0) return "12:00 AM";
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return "12:00 PM";
  if (hour === 24) return "12:00 AM";
  return `${hour - 12}:00 PM`;
}

export default function WorkingHoursPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [providerName, setProviderName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    startHour: 9,
    endHour: 18,
    availability: "",
  });

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login-required");
      return;
    }

    const fetchWorkingHours = async () => {
      try {
        const me = await authFetchJson<{
          success: boolean;
          user: {
            _id: string;
            role: "jobProvider" | "jobSeeker" | "admin";
            fullName: string;
          };
        }>("/auth/me");

        setCheckingAuth(false);

        if (me.user.role !== "jobProvider") {
          setError("Only providers can manage availability.");
          setLoading(false);
          return;
        }

        const data = await authFetchJson<WorkingHoursResponse>(
          "/users/me/working-hours"
        );

        setProviderName(data.provider.fullName || "");
        setForm({
          startHour: data.workingHours?.startHour ?? 9,
          endHour: data.workingHours?.endHour ?? 18,
          availability: data.availability || "",
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load availability";

        if (
          message.toLowerCase().includes("not authorized") ||
          message.toLowerCase().includes("no token") ||
          message.toLowerCase().includes("unauthorized")
        ) {
          router.replace("/login-required");
          return;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkingHours();
  }, [router]);

  const previewText = useMemo(() => {
    return `${formatHourLabel(form.startHour)} to ${formatHourLabel(
      form.endHour
    )}`;
  }, [form.startHour, form.endHour]);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "startHour" || name === "endHour" ? Number(value) : value,
    }));

    setError("");
    setSuccess("");
  };

  const applyPreset = (preset: string) => {
    setForm((prev) => ({ ...prev, availability: preset }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (form.startHour >= form.endHour) {
        setError("Start hour must be earlier than end hour.");
        setSaving(false);
        return;
      }

      const data = await authFetchJson<UpdateWorkingHoursResponse>(
        "/users/me/working-hours",
        {
          method: "PUT",
          body: JSON.stringify({
            startHour: form.startHour,
            endHour: form.endHour,
            availability: form.availability,
          }),
        }
      );

      setSuccess(data.message || "Availability updated successfully.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update availability";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (checkingAuth || loading) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-6 md:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-base font-medium text-slate-700">
            Loading availability settings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
            Provider Settings
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
            Availability setup
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Set the time range clients can choose from while booking you. Your booking page will use these hours to generate available slots.
          </p>
          {providerName ? (
            <p className="mt-3 text-sm font-medium text-slate-500">
              Provider: {providerName}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 border-b border-slate-200 pb-5">
              <div className="flex items-center gap-2">
                <Clock3 size={18} className="text-blue-600" />
                <p className="text-sm font-semibold text-slate-900">
                  Working window
                </p>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Choose your daily start and end time. Keep it simple so seekers can book without confusion.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Start hour
                  </label>
                  <select
                    name="startHour"
                    value={form.startHour}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  >
                    {startHourOptions.map((hour) => (
                      <option key={hour} value={hour}>
                        {formatHourLabel(hour)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    End hour
                  </label>
                  <select
                    name="endHour"
                    value={form.endHour}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  >
                    {endHourOptions.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour === 24
                          ? "12:00 AM (next day)"
                          : formatHourLabel(hour)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Availability note
                </label>
                <textarea
                  name="availability"
                  value={form.availability}
                  onChange={handleChange}
                  placeholder="Example: Available Mon-Sat, closed on festival days"
                  className="min-h-[130px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">
                  Quick notes
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {availabilityPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {success}
                </div>
              ) : null}

              <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-600"
                />
                <p>
                  Booking slots still respect the 1-hour buffer before and after each job, so overlapping bookings stay blocked.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Availability"}
              </button>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Preview</p>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  Booking Window
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-950">
                  {previewText}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Customers will only see slots inside this range.
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">
                  Availability Note
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {form.availability?.trim() || "No availability note added yet."}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 text-sm leading-6 text-blue-900">
              <p className="font-bold">What this affects</p>
              <p className="mt-2">
                Seekers see available slots on your booking page based on these hours. Existing accepted bookings still block nearby times automatically.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
