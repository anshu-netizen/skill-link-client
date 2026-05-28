"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, Sparkles, X } from "lucide-react";
import ExpertCard from "./ExpertCard";
import { apiFetch } from "@/lib/api";

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
  isDummy?: boolean;
};

type ExpertGridProps = {
  searchTerm?: string;
};

const DUMMY_PROVIDERS: Provider[] = [
  {
    _id: "demo-cleaning-01",
    fullName: "Maya CleanCare",
    email: "demo-cleaning@skilllink.com",
    role: "jobProvider",
    phone: "9800000001",
    address: "Baneshwor, Kathmandu",
    city: "Kathmandu",
    bio: "Home, room, and office cleaning with flexible timing and neat finishing.",
    skills: ["Cleaning", "Home Cleaning", "Office Cleaning"],
    experienceLevel: "expert",
    experienceYears: 5,
    isActive: true,
    isVerified: true,
    averageRating: 4.9,
    totalReviews: 24,
    profileImage:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    isDummy: true,
  },
  {
    _id: "demo-electrician-02",
    fullName: "BrightFix Electrician",
    email: "demo-electrician@skilllink.com",
    role: "jobProvider",
    phone: "9800000002",
    address: "New Road, Kathmandu",
    city: "Kathmandu",
    bio: "Safe wiring, light fitting, socket repair, and small electrical fixes.",
    skills: ["Electrician", "Wiring", "Light Installation"],
    experienceLevel: "intermediate",
    experienceYears: 4,
    isActive: true,
    isVerified: true,
    averageRating: 4.7,
    totalReviews: 16,
    profileImage:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
    isDummy: true,
  },
  {
    _id: "demo-plumber-03",
    fullName: "Ramesh Plumbing Service",
    email: "demo-plumber@skilllink.com",
    role: "jobProvider",
    phone: "9800000003",
    address: "Jawalakhel, Lalitpur",
    city: "Lalitpur",
    bio: "Quick help for pipe leaks, sink repair, bathroom fittings, and tank issues.",
    skills: ["Plumbing", "Pipe Repair", "Bathroom Fitting"],
    experienceLevel: "expert",
    experienceYears: 6,
    isActive: true,
    isVerified: true,
    averageRating: 4.8,
    totalReviews: 18,
    profileImage:
      "https://images.unsplash.com/photo-1581092919535-7146ff1a590b?auto=format&fit=crop&w=1200&q=80",
    isDummy: true,
  },
  {
    _id: "demo-gardener-04",
    fullName: "GreenHands Gardener",
    email: "demo-gardener@skilllink.com",
    role: "jobProvider",
    phone: "9800000004",
    address: "Bhaisepati, Lalitpur",
    city: "Lalitpur",
    bio: "Garden cleanup, plant care, trimming, and outdoor maintenance jobs.",
    skills: ["Gardener", "Plant Care", "Outdoor Cleaning"],
    experienceLevel: "intermediate",
    experienceYears: 3,
    isActive: true,
    isVerified: true,
    averageRating: 4.5,
    totalReviews: 9,
    profileImage:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
    isDummy: true,
  },
  {
    _id: "demo-babysitter-05",
    fullName: "CareCircle Babysitting",
    email: "demo-care@skilllink.com",
    role: "jobProvider",
    phone: "9800000005",
    address: "Patan, Lalitpur",
    city: "Lalitpur",
    bio: "Reliable childcare support for short shifts, evenings, and weekends.",
    skills: ["Baby Sitter", "Child Care", "Home Support"],
    experienceLevel: "beginner",
    experienceYears: 2,
    isActive: true,
    isVerified: true,
    averageRating: 4.6,
    totalReviews: 12,
    profileImage:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
    isDummy: true,
  },
  {
    _id: "demo-delivery-06",
    fullName: "SwiftRun Delivery",
    email: "demo-delivery@skilllink.com",
    role: "jobProvider",
    phone: "9800000006",
    address: "Durbar Square, Bhaktapur",
    city: "Bhaktapur",
    bio: "Fast local pickup and delivery for parcels, documents, and quick errands.",
    skills: ["Delivery", "Errands", "Pickup Service"],
    experienceLevel: "intermediate",
    experienceYears: 3,
    isActive: true,
    isVerified: true,
    averageRating: 4.4,
    totalReviews: 10,
    profileImage:
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80",
    isDummy: true,
  },
];

export default function ExpertGrid({ searchTerm = "" }: ExpertGridProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [minimumRating, setMinimumRating] = useState("");

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch<{
          success: boolean;
          count: number;
          providers: Provider[];
        }>("/users/providers");

        const activeProviders = (data.providers || []).filter(
          (provider) => provider.role === "jobProvider" && provider.isActive
        );

        setProviders(activeProviders);
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

  const allProviders = useMemo(() => {
    return [...providers, ...DUMMY_PROVIDERS];
  }, [providers]);

  const skillOptions = useMemo(() => {
    const skills = allProviders.flatMap((provider) => provider.skills || []);
    return Array.from(new Set(skills)).sort();
  }, [allProviders]);

  const cityOptions = useMemo(() => {
    const cities = allProviders
      .map((provider) => provider.city)
      .filter((city): city is string => Boolean(city));
    return Array.from(new Set(cities)).sort();
  }, [allProviders]);

  const filteredProviders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const ratingLimit = minimumRating ? Number(minimumRating) : 0;

    return allProviders.filter((provider) => {
      const haystack = [
        provider.fullName,
        provider.email,
        provider.phone,
        provider.address,
        provider.city,
        provider.bio,
        provider.availability,
        provider.companyName,
        provider.companyDescription,
        ...(provider.skills || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || haystack.includes(query);
      const matchesSkill =
        !selectedSkill ||
        (provider.skills || []).some(
          (skill) => skill.toLowerCase() === selectedSkill.toLowerCase()
        );
      const matchesCity = !selectedCity || provider.city === selectedCity;
      const rating =
        typeof provider.averageRating === "number" ? provider.averageRating : 0;
      const matchesRating = !ratingLimit || rating >= ratingLimit;

      return matchesSearch && matchesSkill && matchesCity && matchesRating;
    });
  }, [allProviders, searchTerm, selectedSkill, selectedCity, minimumRating]);

  const hasActiveFilters = Boolean(selectedSkill || selectedCity || minimumRating);

  const clearFilters = () => {
    setSelectedSkill("");
    setSelectedCity("");
    setMinimumRating("");
  };

  return (
    <section className="mt-12">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
            <Sparkles size={14} />
            Skilled professionals
          </div>

          <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-900">
            Explore Our Experts
          </h2>

          <p className="mt-2 max-w-2xl text-base text-slate-500">
            Browse verified providers, compare ratings, and find the right person for the job.
          </p>
        </div>

        <div className="flex items-center gap-4 self-start lg:self-auto">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Results
            </p>
            <p className="mt-1 text-lg font-black text-slate-900">
              {loading ? "..." : filteredProviders.length}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition ${
              showFilters || hasActiveFilters
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal
              size={18}
              className={showFilters || hasActiveFilters ? "text-blue-600" : "text-slate-500"}
            />
            {showFilters ? "Hide Filters" : "Filters"}
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white">
                On
              </span>
            )}
          </button>
        </div>
      </div>

      {!!searchTerm.trim() && !loading && (
        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
          Showing results for: <span className="font-bold">{searchTerm}</span>
        </div>
      )}

      {showFilters && (
        <div className="mb-6 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900">Filter experts</h3>
              <p className="text-sm text-slate-500">
                Narrow providers by skill, city, or rating.
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Skill</span>
              <select
                value={selectedSkill}
                onChange={(event) => setSelectedSkill(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">All skills</option>
                {skillOptions.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">City</span>
              <select
                value={selectedCity}
                onChange={(event) => setSelectedCity(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">All cities</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Rating</span>
              <select
                value={minimumRating}
                onChange={(event) => setMinimumRating(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Any rating</option>
                <option value="4.5">4.5 stars and above</option>
                <option value="4">4.0 stars and above</option>
                <option value="3">3.0 stars and above</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          Loading providers...
        </div>
      )}

      {!loading && error && (
        <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-700 shadow-sm">
          Could not load live providers, so demo experts are shown below.
        </div>
      )}

      {!loading && filteredProviders.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900">No providers found</h3>
          <p className="mt-2 text-slate-500">
            Try a different search term and let the algorithm catch its breath.
          </p>
        </div>
      )}

      {!loading && filteredProviders.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {filteredProviders.map((provider) => (
            <ExpertCard key={provider._id} provider={provider} />
          ))}
        </div>
      )}
    </section>
  );
}
