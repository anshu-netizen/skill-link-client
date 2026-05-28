"use client";

import Link from "next/link";
import {
  MapPin,
  Star,
  BadgeCheck,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";

type Provider = {
  _id: string;
  fullName: string;
  email: string;
  role: "jobProvider";
  phone: string;
  address: string;
  city: string;
  profileImage?: string;
  bio?: string;
  skills?: string[];
  experienceLevel?: "beginner" | "intermediate" | "expert";
  experienceYears?: number;
  availability?: string;
  companyName?: string;
  companyDescription?: string;
  isActive?: boolean;
  isVerified?: boolean;
  averageRating?: number;
  totalReviews?: number;
};

type Props = {
  provider: Provider;
};

const isUnverifiedDemoProvider = (provider: Provider) =>
  provider.email?.endsWith("@demo.skilllink.local") ||
  provider.companyDescription?.toLowerCase().includes("demo only");

export default function ExpertCard({ provider }: Props) {
  const displayName = provider.companyName?.trim() || provider.fullName;

  const description =
    provider.companyDescription?.trim() ||
    provider.bio?.trim() ||
    "Professional service provider ready to help.";

  const location = provider.city || provider.address || "Unknown";

  const image =
    provider.profileImage?.trim() ||
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80";

  const averageRating =
    typeof provider.averageRating === "number" ? provider.averageRating : 0;

  const totalReviews =
    typeof provider.totalReviews === "number" ? provider.totalReviews : 0;

  const visibleSkills = (provider.skills || []).slice(0, 3);
  const isUnverifiedDemo = isUnverifiedDemoProvider(provider);
  const verified = provider.isVerified === true;

  return (
    <Link href={`/providers/${provider._id}`} className="group block h-full">
      <article
        className={`flex h-full flex-col overflow-hidden rounded-[1.75rem] border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${
          isUnverifiedDemo ? "border-red-200" : "border-slate-200"
        }`}
      >
        <div className="relative h-64 w-full overflow-hidden">
          <img
            src={image}
            alt={displayName}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/15 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {verified ? (
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-700 shadow">
                <BadgeCheck size={14} />
                Verified
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-amber-700 shadow">
                <ShieldAlert size={14} />
                Not Verified
              </div>
            )}

            {isUnverifiedDemo && (
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-red-700 shadow">
                <AlertTriangle size={14} />
                Unverified Demo
              </div>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
            <div className="inline-flex min-w-0 items-center gap-2 rounded-xl bg-black/60 px-3 py-2 text-sm text-white backdrop-blur">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">{location}</span>
            </div>

            <div className="shrink-0 rounded-xl bg-white/95 px-3 py-2 shadow">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span>{totalReviews > 0 ? averageRating.toFixed(1) : "New"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-lg font-black text-slate-900">
                  {displayName}
                </h3>

                {verified && (
                  <BadgeCheck size={18} className="shrink-0 text-blue-500" />
                )}
              </div>

              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>
          </div>

          {isUnverifiedDemo && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold leading-5 text-red-700">
              Demo warning: this provider is intentionally unverified and marked unverified for testing.
            </div>
          )}

          <div className="mt-4 flex min-h-[44px] flex-wrap gap-2">
            {visibleSkills.length > 0 ? (
              visibleSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                General services
              </span>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm font-medium text-slate-500">
              {verified ? "View profile" : "Unverified profile"}
            </span>

            <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 transition group-hover:translate-x-0.5">
              Explore
              <ArrowRight size={15} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
