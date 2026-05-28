"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  User,
  LogOut,
  Sparkles,
  Clock3
} from "lucide-react";
import clsx from "clsx";
import { apiFetch } from "@/lib/api";
import { removeToken } from "@/lib/auth";

type CurrentUser = {
  _id: string;
  fullName: string;
  email: string;
  role: "jobProvider" | "admin";
};

const providerMenuItems = [
  { name: "Dashboard", href: "/provider/dashboard", icon: LayoutDashboard },
  { name: "Bookings", href: "/provider/bookings", icon: BookOpen },
  { name: "Availability", href: "/provider/working-hours", icon: Clock3 },
  { name: "Profile", href: "/provider/me", icon: User },
];

export default function ProviderSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await apiFetch<{ success: boolean; user: CurrentUser }>(
          "/auth/me"
        );
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const handleLogout = () => {
    removeToken();
    setUser(null);
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[260px] flex-col justify-between border-r border-slate-200 bg-white px-6 py-7">
      <div>
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
            <Sparkles size={22} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">SkillLink</h1>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
              Provider
            </p>
          </div>
        </div>

        <nav className="space-y-3">
          {providerMenuItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/provider/dashboard" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-semibold transition-all",
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4 border-t border-slate-200 pt-5">
        {loading ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-400">
            Loading...
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
              {user?.email || "provider@gmail.com"}
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-base font-semibold text-red-500 transition hover:bg-red-50"
            >
              <LogOut size={20} />
              Logout
            </button>
          </>
        )}
      </div>
    </aside>
  );
}