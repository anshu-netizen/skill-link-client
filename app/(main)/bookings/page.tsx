"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Phone,
  Wallet,
  FileText,
  ArrowRight,
  Star,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type CurrentUser = {
  _id: string;
  fullName: string;
  email: string;
  role: "jobSeeker" | "jobProvider" | "admin";
};

type Provider = {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
  city?: string;
  profileImage?: string;
  averageRating?: number;
  totalReviews?: number;
};

type Booking = {
  _id: string;
  serviceTitle: string;
  description?: string;
  bookingDate: string;
  endTime?: string;
  durationMinutes?: number;
  address: string;
  city: string;
  phone: string;
  price: number;
  lat?: number;
  lng?: number;
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "in_progress"
    | "completed"
    | "cancelled";
  notes?: string;
  provider?: Provider;
  createdAt?: string;
  updatedAt?: string;
};

export default function SeekerBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviewableBookingIds, setReviewableBookingIds] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const meData = await apiFetch<{ success: boolean; user: CurrentUser }>(
        "/auth/me"
      );

      if (meData.user.role === "jobProvider") {
        router.replace("/provider/bookings");
        return;
      }

      if (meData.user.role !== "jobSeeker") {
        setError("Only job seekers can view their bookings");
        return;
      }

      const [bookingsData, reviewableData] = await Promise.all([
        apiFetch<{ bookings: Booking[] }>("/bookings/my-bookings"),
        apiFetch<{ bookings: Booking[] }>("/reviews/my-reviewable-bookings").catch(
          () => ({ bookings: [] })
        ),
      ]);

      const bookingList = bookingsData.bookings || [];
      const reviewableList = reviewableData.bookings || [];

      setBookings(bookingList);
      setReviewableBookingIds(new Set(reviewableList.map((b) => b._id)));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load bookings";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      accepted: bookings.filter((b) => b.status === "accepted").length,
      completed: bookings.filter((b) => b.status === "completed").length,
    };
  }, [bookings]);

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-purple-100 text-purple-700";
      case "cancelled":
        return "bg-slate-200 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <main className="min-h-screen px-8 py-10 md:px-10 xl:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Dashboard
          </p>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
            My Bookings
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            Track your booked services, provider updates, and leave reviews after completed jobs.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Bookings" value={stats.total} />
          <StatCard label="Pending" value={stats.pending} />
          <StatCard label="Accepted" value={stats.accepted} />
          <StatCard label="Completed" value={stats.completed} />
        </div>

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-slate-500">Loading bookings...</p>
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">No bookings yet</h2>
            <p className="mt-2 text-slate-500">
              Once you book a provider, your booking details will show up here.
            </p>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => {
              const canReview = reviewableBookingIds.has(booking._id);

              return (
                <div
                  key={booking._id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-700">
                          {booking.serviceTitle}
                        </span>

                        <span
                          className={`rounded-full px-4 py-1.5 text-sm font-bold capitalize ${getStatusClasses(
                            booking.status
                          )}`}
                        >
                          {booking.status.replace("_", " ")}
                        </span>

                        {canReview && (
                          <span className="rounded-full bg-yellow-100 px-4 py-1.5 text-sm font-bold text-yellow-700">
                            Review pending
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl font-bold text-slate-900">
                        {booking.description || "Service booking"}
                      </h2>

                      <p className="mt-2 max-w-3xl text-slate-500">
                        Review your service details below. Contact info, schedule, and location are all here.
                      </p>

                      {booking.provider?.fullName && (
                        <p className="mt-3 text-sm font-medium text-slate-600">
                          Provider:{" "}
                          <span className="font-semibold text-slate-900">
                            {booking.provider.fullName}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-5 py-4 lg:min-w-[220px]">
                      <p className="text-sm font-medium text-slate-500">Estimated Price</p>
                      <p className="mt-1 text-2xl font-extrabold text-slate-900">
                        Rs. {booking.price}
                      </p>

                      {typeof booking.provider?.averageRating === "number" &&
                        booking.provider.totalReviews !== undefined && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                            <Star size={16} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-slate-900">
                              {booking.provider.averageRating.toFixed(1)}
                            </span>
                            <span>
                              ({booking.provider.totalReviews} review
                              {booking.provider.totalReviews === 1 ? "" : "s"})
                            </span>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <InfoCard
                      icon={<CalendarDays size={18} />}
                      label="Booking Date"
                      value={new Date(booking.bookingDate).toLocaleString()}
                    />
                    <InfoCard
                      icon={<MapPin size={18} />}
                      label="Location"
                      value={`${booking.address}, ${booking.city}`}
                    />
                    <InfoCard
                      icon={<Phone size={18} />}
                      label="Phone"
                      value={booking.phone}
                    />
                    <InfoCard
                      icon={<Wallet size={18} />}
                      label="Price"
                      value={`Rs. ${booking.price}`}
                    />
                  </div>

                  {booking.notes && (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-slate-700">
                        <FileText size={18} />
                        <span className="font-semibold">Notes</span>
                      </div>
                      <p className="text-slate-500">{booking.notes}</p>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/bookings/${booking._id}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      View Details
                      <ArrowRight size={16} />
                    </Link>

                    {canReview && (
                      <Link
                        href={`/bookings/${booking._id}?review=1`}
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Star size={16} />
                        Write Review
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h3 className="mt-2 text-3xl font-extrabold text-slate-900">{value}</h3>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-700">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <p className="text-sm leading-6 text-slate-500">{value}</p>
    </div>
  );
}