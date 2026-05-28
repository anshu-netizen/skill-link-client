"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  Star,
  Wrench,
  X,
  ShieldAlert,
  AlertTriangle,
  BadgeCheck,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type Provider = {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  city: string;
  profileImage?: string;
  bio?: string;
  skills?: string[];
  experienceLevel?: string;
  experienceYears?: number;
  averageRating?: number;
  totalReviews?: number;
  companyName?: string;
  companyDescription?: string;
  isVerified?: boolean;
};

const isUnverifiedDemoProvider = (provider: Provider) =>
  provider.email?.endsWith("@demo.skilllink.local") ||
  provider.companyDescription?.toLowerCase().includes("demo only");

export default function MarketplacePage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedTrust, setSelectedTrust] = useState("");

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const data = await apiFetch<{ success: boolean; providers: Provider[] }>(
          "/users/providers"
        );
        setProviders(data.providers || []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load providers";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchProviders();
  }, []);

  const skillOptions = useMemo(() => {
    const skills = providers.flatMap((provider) => provider.skills || []);
    return Array.from(new Set(skills)).sort();
  }, [providers]);

  const cityOptions = useMemo(() => {
    const cities = providers
      .map((provider) => provider.city)
      .filter((city): city is string => Boolean(city?.trim()));
    return Array.from(new Set(cities)).sort();
  }, [providers]);

  const filteredProviders = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    const minimumRating = selectedRating ? Number(selectedRating) : 0;

    return providers.filter((provider) => {
      const providerSkills = provider.skills || [];
      const averageRating =
        typeof provider.averageRating === "number" ? provider.averageRating : 0;
      const isUnverifiedDemo = isUnverifiedDemoProvider(provider);

      const matchesSearch =
        !search ||
        [
          provider.fullName,
          provider.companyName,
          provider.city,
          provider.address,
          provider.bio,
          provider.companyDescription,
          provider.experienceLevel,
          ...providerSkills,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search);

      const matchesSkill =
        !selectedSkill ||
        providerSkills.some(
          (skill) => skill.toLowerCase() === selectedSkill.toLowerCase()
        );

      const matchesCity = !selectedCity || provider.city === selectedCity;
      const matchesRating = !minimumRating || averageRating >= minimumRating;
      const matchesTrust =
        !selectedTrust ||
        (selectedTrust === "verified" && provider.isVerified === true) ||
        (selectedTrust === "unverified" && provider.isVerified !== true) ||
        (selectedTrust === "unverified-demo" && isUnverifiedDemo);

      return (
        matchesSearch &&
        matchesSkill &&
        matchesCity &&
        matchesRating &&
        matchesTrust
      );
    });
  }, [providers, searchText, selectedSkill, selectedCity, selectedRating, selectedTrust]);

  const clearFilters = () => {
    setSearchText("");
    setSelectedSkill("");
    setSelectedCity("");
    setSelectedRating("");
    setSelectedTrust("");
  };

  return (
    <main className="min-h-screen px-8 py-10 md:px-10 xl:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Marketplace
          </p>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
            Find Skill Providers
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            Search by skill, city, rating, or trust status. Demo providers are real database users now, so they can be booked.
          </p>
        </div>

        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(170px,1fr))_auto]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search provider, skill, city..."
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">All skills</option>
              {skillOptions.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">All cities</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Any rating</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
              <option value="5">5.0</option>
            </select>

            <select
              value={selectedTrust}
              onChange={(e) => setSelectedTrust(e.target.value)}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">All trust levels</option>
              <option value="verified">Verified only</option>
              <option value="unverified">Not verified</option>
              <option value="unverified-demo">Unverified demo providers</option>
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <X size={16} />
              Clear
            </button>
          </div>
        </section>

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-slate-500">Loading providers...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && providers.length === 0 && (
          <div className="mb-6 rounded-3xl border border-blue-200 bg-blue-50 p-6 text-blue-700 shadow-sm">
            No providers found yet. Run the demo provider seed script to add bookable demo providers.
          </div>
        )}

        {!loading && filteredProviders.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              No matching providers
            </h2>
            <p className="mt-2 text-slate-500">
              Try clearing the filters or searching another skill.
            </p>
          </div>
        )}

        {!loading && filteredProviders.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-500">
                Showing {filteredProviders.length} provider
                {filteredProviders.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProviders.map((provider) => {
                const averageRating =
                  typeof provider.averageRating === "number"
                    ? provider.averageRating
                    : 0;

                const totalReviews =
                  typeof provider.totalReviews === "number"
                    ? provider.totalReviews
                    : 0;

                const visibleSkills = (provider.skills || []).slice(0, 3);
                const isUnverifiedDemo = isUnverifiedDemoProvider(provider);
                const displayName = provider.companyName?.trim() || provider.fullName;

                return (
                  <div
                    key={provider._id}
                    className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                      isUnverifiedDemo ? "border-red-200" : "border-slate-200"
                    }`}
                  >
                    <div className="relative h-52 bg-slate-100">
                      <img
                        src={
                          provider.profileImage?.trim()
                            ? provider.profileImage
                            : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                        }
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-xl border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm font-bold text-yellow-600 shadow">
                        <Star size={14} fill="currentColor" />
                        {totalReviews > 0 ? averageRating.toFixed(1) : "New"}
                      </div>

                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        {provider.isVerified ? (
                          <div className="inline-flex items-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-700 shadow">
                            <BadgeCheck size={14} />
                            Verified
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-amber-700 shadow">
                            <ShieldAlert size={14} />
                            Not Verified
                          </div>
                        )}

                        {isUnverifiedDemo && (
                          <div className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-red-700 shadow">
                            <AlertTriangle size={14} />
                            Unverified Demo
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl bg-black/70 px-3 py-2 text-sm text-white">
                        <MapPin size={14} />
                        {provider.city || "Unknown"}
                      </div>
                    </div>

                    <div className="p-5">
                      <h2 className="text-2xl font-bold text-slate-900">
                        {displayName}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-slate-500">
                        {provider.bio?.trim() ||
                          "Professional service provider ready to help."}
                      </p>

                      {isUnverifiedDemo && (
                        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                          Demo warning: intentionally unverified and unverified for testing.
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                        <Star
                          size={14}
                          className="fill-yellow-400 text-yellow-400"
                        />
                        <span className="font-semibold text-slate-900">
                          {totalReviews > 0
                            ? averageRating.toFixed(1)
                            : "No ratings yet"}
                        </span>
                        {totalReviews > 0 && (
                          <span>
                            ({totalReviews} review
                            {totalReviews === 1 ? "" : "s"})
                          </span>
                        )}
                      </div>

                      <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                        <div className="mb-2 flex items-center gap-2 text-slate-700">
                          <Wrench size={16} />
                          <span className="text-sm font-semibold">Skills</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {visibleSkills.length > 0 ? (
                            visibleSkills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-slate-500">General</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <Link
                          href={`/providers/${provider._id}`}
                          className="block rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          View Profile
                        </Link>
                        <Link
                          href={`/providers/${provider._id}/book`}
                          className="block rounded-2xl bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
