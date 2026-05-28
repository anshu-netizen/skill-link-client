"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Sparkles,
  Wrench,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "jobSeeker",
    phone: "",
    address: "",
    city: "",
    skills: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (form.role === "jobProvider" && !form.skills.trim()) {
        setError("Skills are required for job providers");
        setLoading(false);
        return;
      }

      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          role: form.role,
          phone: form.phone,
          address: form.address,
          city: form.city,
          skills:
            form.role === "jobProvider"
              ? form.skills
                  .split(",")
                  .map((skill) => skill.trim())
                  .filter(Boolean)
              : [],
        }),
      });

      router.push("/login");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Signup failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="hidden bg-[#0F4AA1] lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Sparkles size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">SkillLink</h1>
              <p className="text-sm text-blue-100">Join the platform in minutes</p>
            </div>
          </div>

          <div className="max-w-xl text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
              Create account
            </p>
            <h2 className="mt-4 text-5xl font-extrabold leading-tight">
              Start booking or offering services with zero mess.
            </h2>
            <p className="mt-5 text-lg leading-8 text-blue-100">
              Whether you need help or you provide it, SkillLink keeps the whole flow simple.
            </p>
          </div>

          <div className="text-sm text-blue-200">
            SkillLink © 2026
          </div>
        </div>

        <div className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8 text-center">
              <h2 className="text-4xl font-extrabold text-slate-900">Create Account</h2>
              <p className="mt-2 text-slate-500">
                Sign up to explore providers or offer your own services.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Full Name" icon={<User size={18} />}>
                <input
                  name="fullName"
                  placeholder="Enter your full name"
                  className="w-full bg-transparent outline-none"
                  onChange={handleChange}
                  value={form.fullName}
                  required
                />
              </Field>

              <Field label="Email" icon={<Mail size={18} />}>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-transparent outline-none"
                  onChange={handleChange}
                  value={form.email}
                  required
                />
              </Field>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-blue-500">
                  <Lock size={18} className="text-slate-400" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="w-full bg-transparent outline-none"
                    onChange={handleChange}
                    value={form.password}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-slate-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Account Type
                </label>
                <select
                  name="role"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  onChange={handleChange}
                  value={form.role}
                >
                  <option value="jobSeeker">Job Seeker</option>
                  <option value="jobProvider">Job Provider</option>
                </select>
              </div>

              {form.role === "jobProvider" && (
                <div className="md:col-span-2">
                  <Field label="Skills" icon={<Wrench size={18} />}>
                    <input
                      name="skills"
                      placeholder="Plumbing, Electrical, Cleaning"
                      className="w-full bg-transparent outline-none"
                      onChange={handleChange}
                      value={form.skills}
                      required={form.role === "jobProvider"}
                    />
                  </Field>
                  <p className="mt-2 text-xs text-slate-500">
                    Separate multiple skills with commas.
                  </p>
                </div>
              )}

              <Field label="Phone" icon={<Phone size={18} />}>
                <input
                  name="phone"
                  placeholder="Enter phone number"
                  className="w-full bg-transparent outline-none"
                  onChange={handleChange}
                  value={form.phone}
                  required
                />
              </Field>

              <Field label="City" icon={<MapPin size={18} />}>
                <input
                  name="city"
                  placeholder="Enter city"
                  className="w-full bg-transparent outline-none"
                  onChange={handleChange}
                  value={form.city}
                  required
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Address" icon={<MapPin size={18} />}>
                  <input
                    name="address"
                    placeholder="Enter address"
                    className="w-full bg-transparent outline-none"
                    onChange={handleChange}
                    value={form.address}
                    required
                  />
                </Field>
              </div>

              {error && (
                <div className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-blue-500">
        <span className="text-slate-400">{icon}</span>
        {children}
      </div>
    </div>
  );
}