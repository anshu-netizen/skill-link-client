import Link from "next/link";

export default function LoginRequiredPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl">
          🔒
        </div>

        <h1 className="mt-6 text-4xl font-extrabold text-slate-900">
          Login required
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-lg leading-8 text-slate-500">
          You need to log in before booking a provider. Please sign in to continue.
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