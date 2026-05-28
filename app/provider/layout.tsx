"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import ProviderSidebar from "@/components/provider/ProviderSidebar";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkProviderAccess = async () => {
      const token = getToken();

      if (!token) {
        router.replace("/login-required");
        if (mounted) setLoading(false);
        return;
      }

      try {
        const data = await apiFetch<{
          success: boolean;
          user: { role: string };
        }>("/auth/me");

        if (data.user.role !== "jobProvider") {
          router.replace("/dashboard");
          if (mounted) {
            setAllowed(false);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setAllowed(true);
          setLoading(false);
        }
      } catch {
        router.replace("/login-required");
        if (mounted) {
          setAllowed(false);
          setLoading(false);
        }
      }
    };

    checkProviderAccess();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-8 py-10">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-500">Checking provider access...</p>
        </div>
      </main>
    );
  }

  if (!allowed) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      <ProviderSidebar />
      <section className="ml-[260px] min-h-screen">
        {children}
      </section>
    </main>
  );
}