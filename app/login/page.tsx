"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShieldAlert,
  RefreshCcw,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth";

type User = {
  _id: string;
  fullName: string;
  email: string;
  role: "jobSeeker" | "jobProvider" | "admin";
};

type LoginResponse = {
  token: string;
  user: User;
};

type ResendResponse = {
  success: boolean;
  message: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  const showVerificationBox = useMemo(
    () =>
      error.toLowerCase().includes("verify your email") ||
      error.toLowerCase().includes("not verified"),
    [error]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (error) setError("");
    if (resendMessage) setResendMessage("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResendMessage("");

    try {
      const data = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setToken(data.token);

      if (data.user.role === "jobProvider") {
        router.push("/provider/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!form.email.trim()) {
      setError("Enter your email first so we can resend the verification link.");
      return;
    }

    setResending(true);
    setResendMessage("");

    try {
      const data = await apiFetch<ResendResponse>(
        "/auth/resend-verification-email",
        {
          method: "POST",
          body: JSON.stringify({ email: form.email }),
        }
      );

      setResendMessage(data.message || "Verification email sent again.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not resend verification email";
      setError(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#eef2f7]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <section className="hidden bg-[#1450ad] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <span className="text-2xl font-bold">✦</span>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">SkillLink</h1>
              <p className="text-base text-white/90">Find and book skilled experts</p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-white/75">
              Welcome Back
            </p>
            <h2 className="text-6xl font-extrabold leading-[1.05] tracking-tight">
              Log in and get things done without the chaos.
            </h2>
            <p className="mt-8 max-w-lg text-2xl leading-10 text-white/90">
              Manage bookings, explore providers, and keep your account in one
              clean place.
            </p>
          </div>

          <p className="text-lg text-white/80">SkillLink © 2026</p>
        </section>

        <section className="flex items-center justify-center px-6 py-10 md:px-10">
          <div className="w-full max-w-[460px] rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_35px_rgba(15,23,42,0.08)] md:p-10">
            <div className="text-center">
              <h2 className="text-5xl font-extrabold tracking-tight text-slate-900">
                Login
              </h2>
              <p className="mt-3 text-lg text-slate-600">
                Welcome back. Enter your details to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <div>
                <label className="mb-2 block text-base font-semibold text-slate-800">
                  Email
                </label>
                <div className="flex h-14 items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 transition-all duration-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                  <Mail size={18} className="text-slate-500" />
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                    onChange={handleChange}
                    value={form.email}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-base font-semibold text-slate-800">
                  Password
                </label>
                <div className="flex h-14 items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 transition-all duration-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                  <Lock size={18} className="text-slate-500" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                    onChange={handleChange}
                    value={form.password}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-slate-500 transition hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {showVerificationBox && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert size={18} className="mt-0.5 text-amber-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900">
                        Email verification required
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-amber-800">
                        This account is not verified yet. Resend the verification
                        email, verify first, then log in.
                      </p>

                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resending}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
                      >
                        <RefreshCcw size={15} />
                        {resending ? "Sending..." : "Resend verification email"}
                      </button>

                      {resendMessage && (
                        <p className="mt-3 text-sm font-medium text-emerald-700">
                          {resendMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="h-14 w-full rounded-2xl bg-[#1f60f0] text-lg font-semibold text-white transition-all duration-200 hover:scale-[1.01] hover:bg-[#174fd0] active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="mt-8 text-center text-base text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#1f60f0] hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}