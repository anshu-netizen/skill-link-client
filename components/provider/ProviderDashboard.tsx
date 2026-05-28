"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock3,
  IndianRupee,
  UserCircle2,
  Wallet,
  CalendarDays,
  MapPin,
  BarChart3,
  TrendingUp,
  Activity,
} from "lucide-react";

type Booking = {
  _id: string;
  serviceTitle: string;
  description?: string;
  bookingDate: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  address?: string;
  city?: string;
  phone?: string;
  price?: number;
};

type User = {
  fullName: string;
  email: string;
};

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [meData, bookingsData] = await Promise.all([
          apiFetch<{ success: boolean; user: User }>("/auth/me"),
          apiFetch<{ success: boolean; bookings: Booking[] }>(
            "/bookings/provider-bookings"
          ),
        ]);

        setUser(meData.user);
        setBookings(bookingsData.bookings || []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard";
        setError(message);
      }
    };

    loadData();
  }, []);

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const accepted = bookings.filter((b) => b.status === "accepted").length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const rejected = bookings.filter((b) => b.status === "rejected").length;

    const totalEarnings = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.price || 0), 0);

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const monthlyBookings = bookings.filter((b) => {
      const date = new Date(b.bookingDate);
      return (
        date.getMonth() === thisMonth && date.getFullYear() === thisYear
      );
    }).length;

    const monthlyEarnings = bookings
      .filter((b) => {
        const date = new Date(b.bookingDate);
        return (
          b.status === "completed" &&
          date.getMonth() === thisMonth &&
          date.getFullYear() === thisYear
        );
      })
      .reduce((sum, b) => sum + (b.price || 0), 0);

    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      pending,
      accepted,
      completed,
      rejected,
      totalEarnings,
      monthlyEarnings,
      monthlyBookings,
      completionRate,
    };
  }, [bookings]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort(
        (a, b) =>
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      )
      .slice(0, 5);
  }, [bookings]);

  const recentActivity = useMemo(() => {
    return [...bookings]
      .sort(
        (a, b) =>
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      )
      .slice(0, 4);
  }, [bookings]);

  const getPercentage = (value: number) => {
    if (stats.total === 0) return 0;
    return Math.round((value / stats.total) * 100);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 md:px-10 xl:px-12">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-8 text-white shadow-xl md:p-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">
                Provider Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-extrabold md:text-5xl">
                Welcome back{user?.fullName ? `, ${user.fullName}` : ""}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-blue-100 md:text-base">
                Track bookings, manage your profile, and monitor your earnings
                from one clean workspace.
              </p>
            </div>

            <div className="flex items-center gap-4 self-start rounded-3xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <UserCircle2 size={30} />
              </div>
              <div>
                <p className="text-sm text-blue-100">Logged in as</p>
                <p className="text-lg font-bold">{user?.email || "Provider"}</p>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-600 shadow-sm">
            {error}
          </div>
        )}

        <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            icon={<BookOpen size={20} />}
            label="Total Bookings"
            value={stats.total}
            accent="blue"
          />
          <StatCard
            icon={<Clock3 size={20} />}
            label="Pending"
            value={stats.pending}
            accent="amber"
          />
          <StatCard
            icon={<UserCircle2 size={20} />}
            label="Accepted"
            value={stats.accepted}
            accent="emerald"
          />
          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Completed"
            value={stats.completed}
            accent="indigo"
          />
          <StatCard
            icon={<Wallet size={20} />}
            label="Total Earnings"
            value={`Rs. ${stats.totalEarnings.toLocaleString()}`}
            accent="green"
          />
        </section>

        <section className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-8">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Recent Bookings
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Your latest booking activity at a glance
                  </p>
                </div>

                <Link
                  href="/provider/bookings"
                  className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  View all
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="group rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                            <Briefcase size={20} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-bold text-slate-900">
                              {booking.serviceTitle}
                            </h3>

                            {booking.description && (
                              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                                {booking.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                            <CalendarDays size={15} />
                            {new Date(booking.bookingDate).toLocaleString()}
                          </div>

                          {(booking.address || booking.city) && (
                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                              <MapPin size={15} />
                              {[booking.address, booking.city]
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                          )}

                          {typeof booking.price === "number" && (
                            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-green-700">
                              <IndianRupee size={15} />
                              {booking.price.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
                        <StatusBadge status={booking.status} />

                        <Link
                          href="/bookings"
                          className="text-sm font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100 hover:underline"
                        >
                          Open bookings
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {recentBookings.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <BookOpen size={24} />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                      No bookings yet
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Complete your profile, stay active, and new customers will
                      find you soon.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Earnings Overview
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    A quick summary of your completed work income
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-gradient-to-br from-green-50 to-white p-5 ring-1 ring-green-100">
                  <p className="text-sm font-medium text-slate-500">
                    Total Earnings
                  </p>
                  <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                    Rs. {stats.totalEarnings.toLocaleString()}
                  </h3>
                  <p className="mt-2 text-sm text-green-700">
                    From completed bookings
                  </p>
                </div>

                <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-white p-5 ring-1 ring-blue-100">
                  <p className="text-sm font-medium text-slate-500">
                    This Month
                  </p>
                  <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                    Rs. {stats.monthlyEarnings.toLocaleString()}
                  </h3>
                  <p className="mt-2 text-sm text-blue-700">
                    Based on this month’s completed jobs
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <Activity size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Recent Activity
                  </h2>
                  <p className="text-sm text-slate-500">
                    Latest updates from your dashboard
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((booking) => (
                    <div
                      key={booking._id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {booking.serviceTitle}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                    No recent activity yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Booking Status Overview
                  </h2>
                  <p className="text-sm text-slate-500">
                    See how your bookings are distributed
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <ProgressRow
                  label="Pending"
                  value={stats.pending}
                  percentage={getPercentage(stats.pending)}
                  barClass="bg-amber-400"
                />
                <ProgressRow
                  label="Accepted"
                  value={stats.accepted}
                  percentage={getPercentage(stats.accepted)}
                  barClass="bg-emerald-500"
                />
                <ProgressRow
                  label="Completed"
                  value={stats.completed}
                  percentage={getPercentage(stats.completed)}
                  barClass="bg-blue-500"
                />
                <ProgressRow
                  label="Rejected"
                  value={stats.rejected}
                  percentage={getPercentage(stats.rejected)}
                  barClass="bg-rose-500"
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold">Monthly Summary</h2>
                  <p className="text-sm text-slate-300">
                    Your current month in numbers
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-sm text-slate-300">Bookings This Month</p>
                  <p className="mt-1 text-3xl font-extrabold">
                    {stats.monthlyBookings}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-sm text-slate-300">Monthly Earnings</p>
                  <p className="mt-1 text-3xl font-extrabold">
                    Rs. {stats.monthlyEarnings.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-sm text-slate-300">Completion Rate</p>
                  <p className="mt-1 text-3xl font-extrabold">
                    {stats.completionRate}%
                  </p>
                </div>
              </div>
            </div>

            
          </aside>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: "blue" | "amber" | "emerald" | "indigo" | "green";
}) {
  const accentClasses: Record<string, string> = {
    blue: "from-blue-50 to-white text-blue-700 ring-blue-100",
    amber: "from-amber-50 to-white text-amber-700 ring-amber-100",
    emerald: "from-emerald-50 to-white text-emerald-700 ring-emerald-100",
    indigo: "from-indigo-50 to-white text-indigo-700 ring-indigo-100",
    green: "from-green-50 to-white text-green-700 ring-green-100",
  };

  return (
    <div
      className={`rounded-[28px] bg-gradient-to-br p-5 shadow-sm ring-1 transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${accentClasses[accent]}`}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
          {icon}
        </div>
        <p className="text-sm font-semibold text-slate-600">{label}</p>
      </div>

      <h3 className="mt-4 text-3xl font-extrabold text-slate-900">{value}</h3>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "pending" | "accepted" | "rejected" | "completed";
}) {
  const classes =
    status === "accepted"
      ? "bg-green-100 text-green-700 ring-1 ring-green-200"
      : status === "pending"
      ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
      : status === "completed"
      ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
      : "bg-red-100 text-red-700 ring-1 ring-red-200";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${classes}`}
    >
      {status}
    </span>
  );
}

function ProgressRow({
  label,
  value,
  percentage,
  barClass,
}: {
  label: string;
  value: number;
  percentage: number;
  barClass: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <p className="text-sm text-slate-500">
          {value} • {percentage}%
        </p>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${barClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}