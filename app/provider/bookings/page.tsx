"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Phone,
  Wallet,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock3,
  XCircle,
  BadgeCheck,
  Loader2,
  Briefcase,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type BookingStatus = "pending" | "accepted" | "rejected" | "completed";

type Booking = {
  _id: string;
  serviceTitle: string;
  description?: string;
  bookingDate: string;
  address?: string;
  city?: string;
  phone?: string;
  price?: number;
  notes?: string;
  status: BookingStatus;
};

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setError("");

      const data = await apiFetch<{ success: boolean; bookings: Booking[] }>(
        "/bookings/provider-bookings"
      );

      setBookings(data.bookings || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load provider bookings";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      accepted: bookings.filter((b) => b.status === "accepted").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      rejected: bookings.filter((b) => b.status === "rejected").length,
    };
  }, [bookings]);

  const updateStatus = async (
    id: string,
    currentStatus: BookingStatus,
    nextStatus: "accepted" | "rejected" | "completed"
  ) => {
    const allowedNextStatuses: Record<BookingStatus, string[]> = {
      pending: ["accepted", "rejected"],
      accepted: ["completed"],
      rejected: [],
      completed: [],
    };

    if (!allowedNextStatuses[currentStatus].includes(nextStatus)) {
      return;
    }

    try {
      setUpdatingId(id);

      await apiFetch(`/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === id ? { ...booking, status: nextStatus } : booking
        )
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update booking status";
      alert(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClasses = (status: BookingStatus) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700 ring-1 ring-green-200";
      case "pending":
        return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
      case "rejected":
        return "bg-red-100 text-red-700 ring-1 ring-red-200";
      case "completed":
        return "bg-blue-100 text-blue-700 ring-1 ring-blue-200";
      default:
        return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 md:px-8 xl:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[30px] bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-7 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">
            Provider
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-5xl">
            Provider Bookings
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-blue-100 md:text-base">
            Review booking requests, update status cleanly, and open full
            booking details by clicking a card.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
          <StatCard
            icon={<Briefcase size={18} />}
            label="Total"
            value={stats.total}
            tint="blue"
          />
          <StatCard
            icon={<Clock3 size={18} />}
            label="Pending"
            value={stats.pending}
            tint="amber"
          />
          <StatCard
            icon={<CheckCircle2 size={18} />}
            label="Accepted"
            value={stats.accepted}
            tint="green"
          />
          <StatCard
            icon={<BadgeCheck size={18} />}
            label="Completed"
            value={stats.completed}
            tint="indigo"
          />
          <StatCard
            icon={<XCircle size={18} />}
            label="Rejected"
            value={stats.rejected}
            tint="red"
          />
        </div>

        {loading && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="animate-spin" size={18} />
              <p>Loading bookings...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-red-600 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <Briefcase size={24} />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">
              No booking requests yet
            </h2>
            <p className="mt-2 text-slate-500">
              When customers send requests, they’ll show up here.
            </p>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => {
              const isUpdating = updatingId === booking._id;

              return (
                <Link
                  key={booking._id}
                  href={`/bookings/${booking._id}`}
                  className="group block"
                >
                  <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md">
                    <div className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50 px-6 py-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="mb-3 flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
                              {booking.serviceTitle}
                            </span>

                            <span
                              className={`rounded-full px-4 py-1.5 text-sm font-bold capitalize ${getStatusClasses(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </div>

                          <h2 className="text-2xl font-bold text-slate-900 transition group-hover:text-blue-600">
                            {booking.description || "Customer booking request"}
                          </h2>

                          <p className="mt-2 max-w-3xl text-slate-500">
                            Click to open full booking information.
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white lg:min-w-[190px]">
                          <p className="text-sm font-medium text-slate-300">
                            Estimated Price
                          </p>
                          <p className="mt-1 text-2xl font-extrabold">
                            Rs. {booking.price ?? 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-6">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <InfoCard
                          icon={<CalendarDays size={18} />}
                          label="Booking Date"
                          value={new Date(booking.bookingDate).toLocaleString()}
                        />
                        <InfoCard
                          icon={<MapPin size={18} />}
                          label="Location"
                          value={`${booking.address || ""}${
                            booking.city ? `, ${booking.city}` : ""
                          }`}
                        />
                        <InfoCard
                          icon={<Phone size={18} />}
                          label="Phone"
                          value={booking.phone || "Not available"}
                        />
                        <InfoCard
                          icon={<Wallet size={18} />}
                          label="Price"
                          value={`Rs. ${booking.price ?? 0}`}
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

                      <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-wrap gap-3">
                          {booking.status === "pending" && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  updateStatus(
                                    booking._id,
                                    booking.status,
                                    "accepted"
                                  );
                                }}
                                disabled={isUpdating}
                                className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-2.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isUpdating ? (
                                  <Loader2
                                    size={16}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <CheckCircle2 size={16} />
                                )}
                                Accept
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  updateStatus(
                                    booking._id,
                                    booking.status,
                                    "rejected"
                                  );
                                }}
                                disabled={isUpdating}
                                className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isUpdating ? (
                                  <Loader2
                                    size={16}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <XCircle size={16} />
                                )}
                                Reject
                              </button>
                            </>
                          )}

                          {booking.status === "accepted" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updateStatus(
                                  booking._id,
                                  booking.status,
                                  "completed"
                                );
                              }}
                              disabled={isUpdating}
                              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isUpdating ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <BadgeCheck size={16} />
                              )}
                              Mark as Completed
                            </button>
                          )}

                          {booking.status === "rejected" && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
                              This booking was rejected. No further actions
                              available.
                            </div>
                          )}

                          {booking.status === "completed" && (
                            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700">
                              This booking is completed.
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Link
                            href={`/provider/bookings/${booking._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            View Booking Details
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tint: "blue" | "amber" | "green" | "indigo" | "red";
}) {
  const styles: Record<string, string> = {
    blue: "from-blue-50 to-white ring-blue-100 text-blue-700",
    amber: "from-amber-50 to-white ring-amber-100 text-amber-700",
    green: "from-green-50 to-white ring-green-100 text-green-700",
    indigo: "from-indigo-50 to-white ring-indigo-100 text-indigo-700",
    red: "from-red-50 to-white ring-red-100 text-red-700",
  };

  return (
    <div
      className={`rounded-[24px] bg-gradient-to-br p-4 shadow-sm ring-1 ${styles[tint]}`}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
          {icon}
        </div>
        <p className="text-sm font-semibold text-slate-600">{label}</p>
      </div>
      <h3 className="mt-4 text-2xl font-extrabold text-slate-900">{value}</h3>
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
      <p className="text-sm leading-6 text-slate-500">
        {value || "Not available"}
      </p>
    </div>
  );
}