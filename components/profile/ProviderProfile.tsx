"use client";

import {
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Briefcase,
  Clock3,
  Building2,
  FileText,
  BadgeCheck,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import type { User } from "@/app/(main)/me/page";

export default function ProviderProfile({ user }: { user: User }) {
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

  const updatedDate = user.updatedAt
    ? new Date(user.updatedAt).toLocaleDateString()
    : "Not available";

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-10 md:px-10 xl:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Provider Account
          </p>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
            My Profile
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            Manage your professional profile and service information.
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
                Service Provider
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span
                  className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                    user.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>

                <span
                  className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                    user.isVerified
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {user.isVerified ? "Verified" : "Not Verified"}
                </span>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-500">
                {user.bio?.trim() ? user.bio : "No bio added yet."}
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

          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Experience" value={typeof user.experienceYears === "number" ? `${user.experienceYears} years` : "Not set"} />
              <StatCard label="Level" value={user.experienceLevel || "Not set"} />
              <StatCard label="Availability" value={user.availability || "Not set"} />
              <StatCard label="Verified" value={user.isVerified ? "Yes" : "No"} />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-extrabold text-slate-900">
                Basic Information
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoCard icon={<Mail size={18} />} label="Email" value={user.email} />
                <InfoCard icon={<Phone size={18} />} label="Phone" value={user.phone} />
                <InfoCard icon={<MapPin size={18} />} label="Address" value={user.address} />
                <InfoCard icon={<MapPin size={18} />} label="City" value={user.city} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-extrabold text-slate-900">
                Professional Information
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoCard
                  icon={<Wrench size={18} />}
                  label="Skills"
                  value={user.skills?.length ? user.skills.join(", ") : undefined}
                />
                <InfoCard
                  icon={<Briefcase size={18} />}
                  label="Experience Level"
                  value={user.experienceLevel}
                />
                <InfoCard
                  icon={<BadgeCheck size={18} />}
                  label="Experience Years"
                  value={
                    typeof user.experienceYears === "number"
                      ? `${user.experienceYears} years`
                      : undefined
                  }
                />
                <InfoCard
                  icon={<Clock3 size={18} />}
                  label="Availability"
                  value={user.availability}
                />
                <InfoCard
                  icon={<Building2 size={18} />}
                  label="Company Name"
                  value={user.companyName}
                />
                <InfoCard
                  icon={<FileText size={18} />}
                  label="Company Description"
                  value={user.companyDescription}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-extrabold text-slate-900">
                Account Metadata
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <InfoCard
                  icon={<ShieldCheck size={18} />}
                  label="Account Status"
                  value={user.isActive ? "Active" : "Inactive"}
                />
                <InfoCard
                  icon={<BadgeCheck size={18} />}
                  label="Verified"
                  value={user.isVerified ? "Yes" : "No"}
                />
                <InfoCard
                  icon={<CalendarDays size={18} />}
                  label="Created At"
                  value={joinedDate}
                />
                <InfoCard
                  icon={<CalendarDays size={18} />}
                  label="Updated At"
                  value={updatedDate}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h3 className="mt-2 text-2xl font-extrabold text-slate-900">{value}</h3>
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