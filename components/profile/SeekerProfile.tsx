"use client";

import { Mail, Phone, MapPin, CalendarDays, UserCircle2 } from "lucide-react";
import type { User } from "@/app/(main)/me/page";

export default function SeekerProfile({ user }: { user: User }) {
  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "Not available";

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-10 md:px-10 xl:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Account
          </p>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
            My Profile
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            View your personal account information.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[340px_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {user.profileImage?.trim() ? (
                <img
                  src={user.profileImage}
                  alt={user.fullName}
                  className="h-28 w-28 rounded-full object-cover ring-4 ring-blue-100"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-600 text-3xl font-extrabold text-white ring-4 ring-blue-100">
                  {initials}
                </div>
              )}

              <h2 className="mt-5 text-3xl font-extrabold text-slate-900">
                {user.fullName}
              </h2>

              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                Customer
              </p>
            </div>

            <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4">
              <MiniRow icon={<Mail size={16} />} text={user.email || "Not set"} />
              <MiniRow icon={<Phone size={16} />} text={user.phone || "Not set"} />
              <MiniRow
                icon={<MapPin size={16} />}
                text={[user.address, user.city].filter(Boolean).join(", ") || "Not set"}
              />
              <MiniRow icon={<CalendarDays size={16} />} text={`Joined: ${joinedDate}`} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-extrabold text-slate-900">
              Basic Information
            </h3>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoCard icon={<UserCircle2 size={18} />} label="Full Name" value={user.fullName} />
              <InfoCard icon={<Mail size={18} />} label="Email" value={user.email} />
              <InfoCard icon={<Phone size={18} />} label="Phone" value={user.phone} />
              <InfoCard icon={<MapPin size={18} />} label="Address" value={user.address} />
              <InfoCard icon={<MapPin size={18} />} label="City" value={user.city} />
              <InfoCard icon={<CalendarDays size={18} />} label="Joined" value={joinedDate} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-700">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <p className="text-sm leading-6 text-slate-500">{value?.trim() ? value : "Not available"}</p>
    </div>
  );
}

function MiniRow({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <span className="text-slate-500">{icon}</span>
      <span>{text}</span>
    </div>
  );
}