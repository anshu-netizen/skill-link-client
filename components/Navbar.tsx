"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { removeToken } from "@/lib/auth";
import type { User } from "@/types";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiFetch<{ user: User }>("/auth/me");
        setUser(data.user);
      } catch {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    removeToken();
    window.location.href = "/login";
  };

  return (
    <nav className="flex items-center justify-between border-b px-6 py-4">
      <Link href="/" className="text-xl font-bold">
        SkillLink
      </Link>

      <div className="flex items-center gap-4">
        {!user ? (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup">Signup</Link>
          </>
        ) : (
          <>
            <Link href="/me">Profile</Link>

            {user.role === "jobSeeker" && (
              <Link href="/bookings">My Bookings</Link>
            )}

            {user.role === "jobProvider" && (
              <Link href="/provider/bookings">Provider Bookings</Link>
            )}

            <button
              onClick={handleLogout}
              className="rounded bg-black px-3 py-1 text-white"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}