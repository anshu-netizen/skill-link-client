"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Phone,
  Briefcase,
  Wrench,
  Building2,
  ShieldCheck,
  MapPinned,
  BadgeCheck,
  Star,
  MessageSquare,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import MapPickerModal from "@/components/booking/MapPickerModal";

type Provider = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  profileImage?: string;
  bio?: string;
  skills?: string[];
  experienceLevel?: string;
  experienceYears?: number;
  availability?: string;
  companyName?: string;
  companyDescription?: string;
  isVerified?: boolean;
};

type LocationCoords = {
  lat: number;
  lng: number;
};

type AvailableSlotsResponse = {
  success: boolean;
  slots: string[];
};

type ReviewItem = {
  _id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  seeker?: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
  booking?: {
    _id: string;
    serviceTitle?: string;
    bookingDate?: string;
  };
};

type ProviderReviewsResponse = {
  success: boolean;
  provider?: {
    _id: string;
    fullName: string;
    averageRating?: number;
    totalReviews?: number;
  };
  count?: number;
  reviews?: ReviewItem[];
};

const FALLBACK_SERVICE_OPTIONS = [
  "Plumbing",
  "Electrical Repair",
  "Cleaning",
  "Gardening",
  "Delivery",
  "Baby Sitting",
  "Painting",
  "Home Repair",
  "Other Service",
];

const CITY_OPTIONS = [
  "Kathmandu",
  "Lalitpur",
  "Bhaktapur",
  "Kirtipur",
  "Pokhara",
  "Chitwan",
  "Butwal",
  "Other",
];

const NOTE_OPTIONS = [
  "Please call before arriving",
  "This is urgent",
  "I am flexible with time",
  "Bring required tools",
  "Please message me before coming",
  "No extra instructions",
];

function getMinBookingDateTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDateTimeLocal(dateString: string) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatSlotLabel(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BookProviderPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = String(params.id);

  const [provider, setProvider] = useState<Provider | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingProvider, setLoadingProvider] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [form, setForm] = useState({
    serviceTitle: "",
    description: "",
    bookingDate: "",
    durationMinutes: "60",
    address: "",
    city: "",
    phone: "",
    price: "",
    notes: "",
  });

  const serviceOptions = useMemo(() => {
    const providerSkills =
      provider?.skills
        ?.map((skill) => skill.trim())
        .filter(Boolean) || [];

    return Array.from(
      new Set([...providerSkills, ...FALLBACK_SERVICE_OPTIONS])
    );
  }, [provider?.skills]);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login-required");
      return;
    }

    const checkUserAndFetchProvider = async () => {
      try {
        await apiFetch("/auth/me");
        setCheckingAuth(false);

        const data = await apiFetch<{ success: boolean; provider: Provider }>(
          `/users/providers/${providerId}`
        );

        setProvider(data.provider);

        try {
          const reviewsData = await apiFetch<ProviderReviewsResponse>(
            `/reviews/provider/${providerId}`
          );

          const fetchedReviews = reviewsData.reviews || [];
          setReviews(fetchedReviews);
          setAverageRating(
            typeof reviewsData.provider?.averageRating === "number"
              ? reviewsData.provider.averageRating
              : 0
          );
          setTotalReviews(
            typeof reviewsData.provider?.totalReviews === "number"
              ? reviewsData.provider.totalReviews
              : fetchedReviews.length
          );
        } catch (reviewErr) {
          console.error("REVIEWS FETCH ERROR:", reviewErr);
          setReviews([]);
          setAverageRating(0);
          setTotalReviews(0);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load provider";

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
        setLoadingProvider(false);
      }
    };

    checkUserAndFetchProvider();
  }, [providerId, router]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      const selectedDateOnly = form.bookingDate
        ? form.bookingDate.split("T")[0]
        : getMinBookingDateTime().split("T")[0];

      if (!providerId || !selectedDateOnly || !form.durationMinutes) {
        setAvailableSlots([]);
        return;
      }

      try {
        setLoadingSlots(true);

        const data = await apiFetch<AvailableSlotsResponse>(
          `/bookings/provider-slots/${providerId}?date=${selectedDateOnly}&durationMinutes=${form.durationMinutes}`
        );

        setAvailableSlots(data.slots || []);
      } catch (err) {
        console.error("AVAILABLE SLOTS ERROR:", err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [providerId, form.bookingDate, form.durationMinutes]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "bookingDate" || name === "durationMinutes") {
      setError("");
    }
  };

  const handleServiceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;

    setForm((prev) => ({
      ...prev,
      serviceTitle: value,
      description:
        value && !prev.description.trim()
          ? `I need help with ${value.toLowerCase()}.`
          : prev.description,
    }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setError("");
      },
      () => {
        setError("Could not get your current location");
      }
    );
  };

  const handleSelectSlot = (slot: string) => {
    setForm((prev) => ({
      ...prev,
      bookingDate: formatDateTimeLocal(slot),
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!location) {
        setError("Please pick your location on the map");
        setSubmitting(false);
        return;
      }

      if (!form.bookingDate) {
        setError("Please select a booking date and time");
        setSubmitting(false);
        return;
      }

      await apiFetch("/bookings", {
        method: "POST",
        body: JSON.stringify({
          providerId,
          serviceTitle: form.serviceTitle,
          description: form.description,
          bookingDate: new Date(form.bookingDate).toISOString(),
          durationMinutes: Number(form.durationMinutes),
          address: form.address,
          city: form.city,
          phone: form.phone,
          price: Number(form.price),
          notes: form.notes,
          lat: location.lat,
          lng: location.lng,
        }),
      });

      router.push("/bookings");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create booking";

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
      setSubmitting(false);
    }
  };

  const initials = useMemo(() => {
    if (!provider?.fullName) return "P";
    return provider.fullName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [provider]);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatReviewDate = (date?: string) => {
    if (!date) return "Recently";
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (checkingAuth || loadingProvider) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-6 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-base font-medium text-slate-700">
            Loading booking page...
          </p>
        </div>
      </main>
    );
  }

  if (error && !provider) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-6 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          {error}
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-slate-100 px-4 py-6 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
              Booking
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
              Book this provider
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Review the provider details, choose an available slot, and send
              your booking request without accidentally booking yesterday like a
              time-travel gremlin.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              {provider?.profileImage?.trim() ? (
                <img
                  src={provider.profileImage}
                  alt={provider.fullName}
                  className="h-56 w-full rounded-3xl object-cover"
                />
              ) : (
                <div className="flex h-56 w-full items-center justify-center rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-5xl font-extrabold text-white shadow-inner">
                  {initials}
                </div>
              )}

              <div className="mt-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
                      Provider Details
                    </p>
                    <h2 className="mt-2 break-words text-2xl font-extrabold text-slate-950">
                      {provider?.fullName || "Provider"}
                    </h2>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-bold ${
                      provider?.isVerified
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {provider?.isVerified ? "Verified" : "Not Verified"}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {provider?.bio?.trim() ||
                    "Professional service provider ready to help."}
                </p>

                <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={17} className="text-blue-600" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Provider Reviews
                        </p>
                        <p className="text-xs text-slate-600">
                          Visible before booking
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm">
                      <div className="flex items-center justify-end gap-1">
                        <Star size={15} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-extrabold text-slate-900">
                          {totalReviews > 0 ? averageRating.toFixed(1) : "New"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {totalReviews} review{totalReviews === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  {reviews.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {reviews.slice(0, 2).map((review) => (
                        <div
                          key={review._id}
                          className="rounded-xl border border-yellow-100 bg-white p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-slate-900">
                                {review.seeker?.fullName || "Anonymous User"}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {review.booking?.serviceTitle || "Completed service"}
                              </p>
                            </div>
                            <StarRating rating={review.rating} />
                          </div>
                          <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">
                            {review.comment?.trim() ||
                              "The customer left a rating without a written comment."}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 rounded-xl border border-dashed border-yellow-200 bg-white p-3 text-xs text-slate-500">
                      No reviews yet for this provider.
                    </p>
                  )}
                </div>

                <div className="mt-5 grid gap-3">
                  <MiniInfo
                    icon={<Wrench size={16} />}
                    label="Skills"
                    value={
                      provider?.skills?.length
                        ? provider.skills.join(", ")
                        : "General services"
                    }
                  />
                  <MiniInfo
                    icon={<Briefcase size={16} />}
                    label="Experience"
                    value={
                      provider?.experienceLevel
                        ? `${provider.experienceLevel}${
                            typeof provider.experienceYears === "number"
                              ? ` • ${provider.experienceYears} years`
                              : ""
                          }`
                        : "Not set"
                    }
                  />
                  <MiniInfo
                    icon={<MapPin size={16} />}
                    label="Location"
                    value={
                      [provider?.address, provider?.city]
                        .filter(Boolean)
                        .join(", ") || "Not set"
                    }
                  />
                  <MiniInfo
                    icon={<Phone size={16} />}
                    label="Phone"
                    value={provider?.phone || "Not set"}
                  />
                  <MiniInfo
                    icon={<Clock3 size={16} />}
                    label="Availability"
                    value={provider?.availability || "Not set"}
                  />
                  <MiniInfo
                    icon={<Building2 size={16} />}
                    label="Company"
                    value={provider?.companyName || "Independent provider"}
                  />

                  {provider?.companyDescription && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-800">
                        Company Description
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {provider.companyDescription}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </aside>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-6 border-b border-slate-200 pb-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
                  Booking Form
                </p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                  Request a service
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Choose a duration, check available times, then submit your
                  request.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <FormField label="Service Title">
                    <select
                      name="serviceTitle"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      value={form.serviceTitle}
                      onChange={handleServiceSelect}
                      required
                    >
                      <option value="">Choose a service</option>
                      {serviceOptions.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Estimated Price">
                    <select
                      name="price"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      value={form.price}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choose estimated price</option>
                      <option value="500">Rs. 500</option>
                      <option value="800">Rs. 800</option>
                      <option value="1000">Rs. 1,000</option>
                      <option value="1500">Rs. 1,500</option>
                      <option value="2000">Rs. 2,000</option>
                      <option value="3000">Rs. 3,000</option>
                      <option value="5000">Rs. 5,000</option>
                    </select>
                  </FormField>
                </div>

                <FormField label="Description">
                  <textarea
                    name="description"
                    placeholder="Describe what you need done..."
                    className="min-h-[140px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    value={form.description}
                    onChange={handleChange}
                    required
                  />
                </FormField>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <FormField label="Duration">
                    <select
                      name="durationMinutes"
                      value={form.durationMinutes}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      required
                    >
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                      <option value="180">3 hours</option>
                      <option value="240">4 hours</option>
                    </select>
                  </FormField>

                  <FormField label="Phone">
                    <input
                      name="phone"
                      placeholder="Phone number"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </FormField>
                </div>

                <FormField label="Booking Date & Time">
                  <div className="relative">
                    <input
                      name="bookingDate"
                      type="datetime-local"
                      min={getMinBookingDateTime()}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      value={form.bookingDate}
                      onChange={handleChange}
                      required
                    />
                    <CalendarDays
                      size={18}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Past times are blocked. Providers also get a 1-hour buffer
                    before and after each job.
                  </p>
                </FormField>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        Available Time Slots
                      </p>
                      <p className="text-sm text-slate-600">
                        Tap a slot to autofill the booking time.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    {loadingSlots ? (
                      <p className="text-sm text-slate-500">
                        Loading available slots...
                      </p>
                    ) : availableSlots.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {availableSlots.map((slot) => {
                          const isSelected =
                            form.bookingDate === formatDateTimeLocal(slot);

                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => handleSelectSlot(slot)}
                              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                                isSelected
                                  ? "border border-blue-600 bg-blue-600 text-white"
                                  : "border border-slate-300 bg-white text-slate-800 hover:border-blue-500 hover:text-blue-700"
                              }`}
                            >
                              {formatSlotLabel(slot)}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                        No available slots for that day and duration.
                      </div>
                    )}
                  </div>
                </div>

                <FormField label="Address">
                  <input
                    name="address"
                    placeholder="Enter service address"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                </FormField>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormField label="City">
                    <select
                      name="city"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      value={form.city}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choose city</option>
                      {CITY_OPTIONS.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Notes">
                    <select
                      name="notes"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      value={form.notes}
                      onChange={handleChange}
                    >
                      <option value="">Choose note</option>
                      {NOTE_OPTIONS.map((note) => (
                        <option key={note} value={note}>
                          {note}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <MapPinned size={18} className="text-blue-600" />
                        <p className="font-semibold text-slate-900">
                          Pin exact location
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        Help the provider find your place easily.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                      >
                        Use Current Location
                      </button>

                      <button
                        type="button"
                        onClick={() => setMapOpen(true)}
                        className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Open Map
                      </button>
                    </div>
                  </div>

                  {location ? (
                    <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700">
                      <div className="flex items-center gap-2 font-semibold text-slate-900">
                        <BadgeCheck size={16} className="text-blue-600" />
                        Location selected
                      </div>
                      <p className="mt-2">
                        Latitude: {location.lat.toFixed(6)}
                      </p>
                      <p>Longitude: {location.lng.toFixed(6)}</p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                      No pinned location yet.
                    </div>
                  )}
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />
                  <p>
                    Your request will be sent to the provider for review. They
                    can accept, reject, or complete it later.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Submitting booking..." : "Confirm Booking"}
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>

      <MapPickerModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        value={location}
        onSave={(coords) => {
          setLocation(coords);
          setMapOpen(false);
        }}
      />
    </>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
      </label>
      {children}
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={13}
          className={
            value <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-slate-300"
          }
        />
      ))}
    </div>
  );
}

function MiniInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-slate-500">{icon}</div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="mt-1 break-words text-sm leading-6 text-slate-600">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}