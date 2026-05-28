"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  LoaderCircle,
  MailCheck,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type VerifyResponse = {
  success: boolean;
  message: string;
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setSuccess(false);
        setMessage("Missing verification token.");
        setLoading(false);
        return;
      }

      try {
        const data = await apiFetch<VerifyResponse>(
          `/auth/verify-email?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
          }
        );

        setSuccess(data.success);
        setMessage(data.message || "Email verified successfully.");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Verification failed.";

        setSuccess(false);
        setMessage(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <VerifyEmailView
      loading={loading}
      success={success}
      message={message}
    />
  );
}

function VerifyEmailFallback() {
  return (
    <VerifyEmailView
      loading={true}
      success={false}
      message="Loading verification page..."
    />
  );
}

function VerifyEmailView({
  loading,
  success,
  message,
}: {
  loading: boolean;
  success: boolean;
  message: string;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#eef2ff_30%,_#f8fafc_68%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.12),transparent_20%),radial-gradient(circle_at_10%_80%,rgba(168,85,247,0.08),transparent_24%)]" />

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[1.02fr_0.98fr]">
        <section className="hidden px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Sparkles size={18} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">
                  SkillLink
                </h1>
                <p className="text-sm text-slate-600">
                  Secure and smooth account access
                </p>
              </div>
            </div>

            <div className="mt-16 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                <ShieldCheck size={14} />
                Email verification
              </div>

              <h2 className="mt-6 text-6xl font-black leading-[1.02] tracking-tight text-slate-950">
                Confirm your account and step right in.
              </h2>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
                Verification keeps the platform more secure, reduces fake
                signups, and makes the whole auth flow feel clean and reliable.
              </p>
            </div>
          </div>

          <div className="grid max-w-xl gap-4">
            <FeatureCard
              title="Safer onboarding"
              text="Verified email helps make accounts more trustworthy before users enter the platform."
            />
            <FeatureCard
              title="Consistent experience"
              text="Signup, verification, and login now feel like one polished product instead of random disconnected screens."
            />
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 md:px-8">
          <div className="w-full max-w-[520px] rounded-[36px] border border-white/70 bg-white/90 p-8 shadow-[0_25px_90px_rgba(15,23,42,0.10)] backdrop-blur-xl md:p-10">
            <div className="text-center">
              <div
                className={`mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] ${
                  loading
                    ? "bg-blue-50 text-blue-600"
                    : success
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {loading ? (
                  <LoaderCircle size={38} className="animate-spin" />
                ) : success ? (
                  <CheckCircle2 size={38} />
                ) : (
                  <XCircle size={38} />
                )}
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700">
                <MailCheck size={14} />
                Verification status
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
                {loading
                  ? "Checking your verification"
                  : success
                  ? "You’re verified"
                  : "Verification failed"}
              </h1>

              <p className="mt-4 text-base leading-8 text-slate-600">
                {message}
              </p>

              <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-left">
                <div className="text-sm font-semibold text-slate-900">
                  What happens next
                </div>

                <div className="mt-4 grid gap-3">
                  {success ? (
                    <>
                      <MiniStep text="Your account is now verified and ready to use" />
                      <MiniStep text="You can continue to login and access SkillLink" />
                    </>
                  ) : (
                    <>
                      <MiniStep text="Return to login and try again if needed" />
                      <MiniStep text="If the link expired, request a new verification email" />
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {success ? (
                  <Link
                    href="/login"
                    className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
                  >
                    Go to login
                    <ArrowRight size={18} />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="inline-flex min-w-[180px] items-center justify-center rounded-2xl border border-slate-200 px-5 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Back to login
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
                    >
                      Create a new account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function MiniStep({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
      <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
      <span className="text-sm font-medium text-slate-700">{text}</span>
    </div>
  );
}