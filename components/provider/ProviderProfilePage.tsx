"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  UserCircle2,
  Pencil,
  Star,
  MessageSquare,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type WorkingHours = {
  startHour: number;
  endHour: number;
};

type User = {
  _id: string;
  fullName: string;
  email: string;
  role: "jobProvider";
  phone?: string;
  address?: string;
  city?: string;
  profileImage?: string;
  bio?: string;
  skills?: string[];
  experienceLevel?: "" | "beginner" | "intermediate" | "expert";
  experienceYears?: number;
  availability?: string;
  companyName?: string;
  companyDescription?: string;
  workingHours?: WorkingHours;
  isActive?: boolean;
  isVerified?: boolean;
  averageRating?: number;
  totalReviews?: number;
  createdAt?: string;
  updatedAt?: string;
};

type MeResponse = {
  success: boolean;
  user: User;
};

export default function ProviderProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await apiFetch<MeResponse>("/auth/me");
        setUser(data.user);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load profile";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchMe();
  }, []);

  const formatDate = (date?: string) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString();
  };

  const formatExperienceLevel = (level?: string) => {
    if (!level?.trim()) return "Not available";
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const formatWorkingHours = (workingHours?: WorkingHours) => {
    if (!workingHours) return "Not available";

    const formatHour = (hour: number) => {
      const period = hour >= 12 ? "PM" : "AM";
      const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
      return `${normalizedHour}:00 ${period}`;
    };

    return `${formatHour(workingHours.startHour)} - ${formatHour(
      workingHours.endHour
    )}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen px-8 py-10 md:px-10 xl:px-12">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-500">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="min-h-screen px-8 py-10 md:px-10 xl:px-12">
        <div className="mx-auto max-w-7xl rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600 shadow-sm">
          {error || "Could not load profile"}
        </div>
      </main>
    );
  }

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "P";

  const locationText =
    [user.address, user.city].filter(Boolean).join(", ") || "Not set";

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-10 md:px-10 xl:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Provider Account
            </p>
            <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
              My Profile
            </h1>
            <p className="mt-2 text-lg text-slate-500">
              Manage your professional profile, service details, and reputation.
            </p>
          </div>

          <Link
            href="/provider/me/edit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Pencil size={16} />
            Edit Profile
          </Link>
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

              <div className="mt-5 flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-slate-900">
                    {(user.averageRating ?? 0).toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <MessageSquare size={16} />
                  <span className="font-bold text-slate-900">
                    {user.totalReviews ?? 0}
                  </span>
                  <span>reviews</span>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-500">
                {user.bio?.trim() ? user.bio : "No bio added yet."}
              </p>
            </div>

            <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4">
              <MiniRow icon={<Mail size={16} />} text={user.email || "Not set"} />
              <MiniRow icon={<Phone size={16} />} text={user.phone || "Not set"} />
              <MiniRow icon={<MapPin size={16} />} text={locationText} />
              <MiniRow
                icon={<CalendarDays size={16} />}
                text={`Joined: ${formatDate(user.createdAt)}`}
              />
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Experience"
                value={`${user.experienceYears ?? 0} years`}
              />
              <StatCard
                label="Level"
                value={formatExperienceLevel(user.experienceLevel)}
              />
              <StatCard
                label="Availability"
                value={user.availability?.trim() || "Not available"}
              />
              <StatCard
                label="Working Hours"
                value={formatWorkingHours(user.workingHours)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard
                label="Average Rating"
                value={(user.averageRating ?? 0).toFixed(1)}
              />
              <StatCard
                label="Total Reviews"
                value={String(user.totalReviews ?? 0)}
              />
            </div>

            <Section title="Basic Information">
              <InfoGrid>
                <InfoCard icon={<Mail size={18} />} label="Email" value={user.email} />
                <InfoCard icon={<Phone size={18} />} label="Phone" value={user.phone} />
                <InfoCard icon={<MapPin size={18} />} label="Address" value={user.address} />
                <InfoCard icon={<MapPin size={18} />} label="City" value={user.city} />
                <InfoCard
                  icon={<UserCircle2 size={18} />}
                  label="Bio"
                  value={user.bio}
                />
                <InfoCard
                  icon={<Clock3 size={18} />}
                  label="Working Hours"
                  value={formatWorkingHours(user.workingHours)}
                />
              </InfoGrid>
            </Section>

            <Section title="Professional Information">
              <InfoGrid>
                <InfoCard
                  icon={<Wrench size={18} />}
                  label="Skills"
                  value={user.skills?.length ? user.skills.join(", ") : ""}
                />
                <InfoCard
                  icon={<Briefcase size={18} />}
                  label="Experience Level"
                  value={formatExperienceLevel(user.experienceLevel)}
                />
                <InfoCard
                  icon={<BadgeCheck size={18} />}
                  label="Experience Years"
                  value={`${user.experienceYears ?? 0} years`}
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
              </InfoGrid>
            </Section>

            <Section title="Account Metadata">
              <InfoGrid>
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
                  value={formatDate(user.createdAt)}
                />
                <InfoCard
                  icon={<CalendarDays size={18} />}
                  label="Updated At"
                  value={formatDate(user.updatedAt)}
                />
              </InfoGrid>
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-2xl font-extrabold text-slate-900">{title}</h3>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
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
      <p className="text-sm leading-6 text-slate-500">
        {value?.trim() ? value : "Not available"}
      </p>
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