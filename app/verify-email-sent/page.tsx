"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  ShieldCheck,
  RefreshCcw,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type ResendResponse = {
  success: boolean;
  message: string;
};

function VerifyEmailSentContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const role = searchParams.get("role") || "";

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    if (!email) {
      setMessage("Missing email address.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await apiFetch<ResendResponse>(
        "/auth/resend-verification-email",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        }
      );

      setMessage(data.message || "Verification email sent again.");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Could not resend verification email.";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VerifyEmailSentView
      email={email}
      role={role}
      loading={loading}
      message={message}
      onResend={handleResend}
    />
  );
}

function VerifyEmailSentFallback() {
  return (
    <VerifyEmailSentView
      email=""
      role=""
      loading={false}
      message=""
      onResend={() => {}}
    />
  );
}

export default function VerifyEmailSentPage() {
  return (
    <Suspense fallback={<VerifyEmailSentFallback />}>
      <VerifyEmailSentContent />
    </Suspense>
  );
}

function VerifyEmailSentView({
  email,
  role,
  loading,
  message,
  onResend,
}: {
  email: string;
  role: string;
  loading: boolean;
  message: string;
  onResend: () => void;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,_#dbeafe,_#eef2ff_30%,_#f8fafc_68%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(59,130,246,0.12),transparent_18%),radial-gradient(circle_at_85%_80%,rgba(168,85,247,0.08),transparent_22%)]" />

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_1fr]">
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
                  Join the platform in minutes
                </p>
              </div>
            </div>

            <div className="mt-16 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                <ShieldCheck size={14} />
                Verification sent
              </div>

              <h2 className="mt-6 text-6xl font-black leading-[1.02] tracking-tight text-slate-950">
                Check your inbox and finish setting things up.
              </h2>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
                We sent your verification link. Open the email, confirm your
                account, then come back and log in to SkillLink.
              </p>
            </div>
          </div>

          <div className="grid max-w-xl gap-4">
            <FeatureCard
              title="Fast next step"
              text="You’re one click away from activating your account and getting into the app."
            />
            <FeatureCard
              title="Cleaner auth flow"
              text="Everything from signup to verification stays structured, readable, and easy to follow."
            />
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 md:px-8">
          <div className="w-full max-w-[560px] rounded-[36px] border border-white/70 bg-white/92 p-8 shadow-[0_25px_90px_rgba(15,23,42,0.10)] backdrop-blur-xl md:p-10">
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] bg-blue-50 text-blue-600">
                <Mail size={34} />
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700">
                <ShieldCheck size={14} />
                Email sent
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
                One last step
              </h1>

              <p className="mt-4 text-base leading-8 text-slate-600">
                Click the verification button in your email. If the message does
                not appear, check spam or resend it below.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <InfoBox label="Email" value={email || "Not available"} />
              <InfoBox label="Account type" value={role || "SkillLink user"} />
            </div>

            <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-900">
                What to do now
              </div>

              <div className="mt-4 grid gap-3">
                <MiniStep text="Open your inbox" />
                <MiniStep text="Find the email from SkillLink" />
                <MiniStep text="Click Verify Email" />
                <MiniStep text="Return and log in" />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onResend}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900 disabled:opacity-60"
              >
                <RefreshCcw size={16} />
                {loading ? "Sending..." : "Resend email"}
              </button>

              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Go to login
                <ArrowRight size={16} />
              </Link>
            </div>

            {message && (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                {message}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value}
      </div>
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