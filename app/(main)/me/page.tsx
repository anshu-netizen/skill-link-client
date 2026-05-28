"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import SeekerProfile from "@/components/profile/SeekerProfile";
import ProviderProfile from "@/components/profile/ProviderProfile";

export type User = {
  _id: string;
  fullName: string;
  email: string;
  role: "jobSeeker" | "jobProvider" | "admin";
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
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function MePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await apiFetch<{ success: boolean; user: User }>("/auth/me");
        setUser(data.user);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load profile";

        if (
          message.toLowerCase().includes("not authorized") ||
          message.toLowerCase().includes("no token") ||
          message.toLowerCase().includes("unauthorized")
        ) {
          setUnauthenticated(true);
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-8 py-10 md:px-10 xl:px-12">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-500">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (unauthenticated) {
    return (
      <main className="min-h-screen bg-slate-50 px-8 py-10 md:px-10 xl:px-12">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl">
            👤
          </div>

          <h1 className="mt-6 text-4xl font-extrabold text-slate-900">
            You’re not logged in
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-lg leading-8 text-slate-500">
            Please log in to view your profile, bookings, and provider details.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Go to Login
            </Link>

            <Link
              href="/signup"
              className="rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="min-h-screen bg-slate-50 px-8 py-10 md:px-10 xl:px-12">
        <div className="mx-auto max-w-5xl rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600 shadow-sm">
          {error || "Could not load profile"}
        </div>
      </main>
    );
  }

  if (user.role === "jobProvider") {
    return <ProviderProfile user={user} />;
  }

  return <SeekerProfile user={user} />;
}