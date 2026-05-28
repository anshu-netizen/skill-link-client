"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, Upload, User as UserIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";

type WorkingHours = {
  startHour: number;
  endHour: number;
};

type User = {
  _id: string;
  fullName: string;
  email: string;
  role: "jobProvider";
  phone?: string;
  address?: string;
  city?: string;
  profileImage?: string;
  bio?: string;
  skills?: string[];
  experienceLevel?: "" | "beginner" | "intermediate" | "expert";
  experienceYears?: number;
  availability?: string;
  companyName?: string;
  companyDescription?: string;
  workingHours?: WorkingHours;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type MeResponse = {
  success: boolean;
  user: User;
};

type UpdateProfilePayload = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  profileImage: string;
  bio: string;
  skills: string[];
  experienceLevel: "" | "beginner" | "intermediate" | "expert";
  experienceYears: number;
  availability: string;
  companyName: string;
  companyDescription: string;
  workingHours: {
    startHour: number;
    endHour: number;
  };
};

export default function EditProviderProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [form, setForm] = useState<UpdateProfilePayload>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    profileImage: "",
    bio: "",
    skills: [],
    experienceLevel: "",
    experienceYears: 0,
    availability: "",
    companyName: "",
    companyDescription: "",
    workingHours: {
      startHour: 9,
      endHour: 18,
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError("");

        const data = await apiFetch<MeResponse>("/auth/me");

        setEmail(data.user.email || "");

        setForm({
          fullName: data.user.fullName || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
          city: data.user.city || "",
          profileImage: data.user.profileImage || "",
          bio: data.user.bio || "",
          skills: data.user.skills || [],
          experienceLevel: data.user.experienceLevel || "",
          experienceYears: data.user.experienceYears ?? 0,
          availability: data.user.availability || "",
          companyName: data.user.companyName || "",
          companyDescription: data.user.companyDescription || "",
          workingHours: {
            startHour: data.user.workingHours?.startHour ?? 9,
            endHour: data.user.workingHours?.endHour ?? 18,
          },
        });

        setImagePreview(data.user.profileImage || "");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load profile";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, []);

  const handleChange = (
    field: keyof UpdateProfilePayload,
    value: string | number | string[]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWorkingHourChange = (
    field: "startHour" | "endHour",
    value: number
  ) => {
    setForm((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [field]: value,
      },
    }));
  };

  const handleSkillsChange = (value: string) => {
    const skillsArray = value
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    setForm((prev) => ({
      ...prev,
      skills: skillsArray,
    }));
  };

  const handleImageChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be 5MB or less");
      return;
    }

    setError("");

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(previewUrl);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.fullName.trim()) {
        setError("Full name is required");
        return;
      }

      if (
        form.workingHours.startHour < 0 ||
        form.workingHours.startHour > 23 ||
        form.workingHours.endHour < 1 ||
        form.workingHours.endHour > 24
      ) {
        setError("Working hours are invalid");
        return;
      }

      if (form.workingHours.startHour >= form.workingHours.endHour) {
        setError("Start hour must be less than end hour");
        return;
      }

      if (form.experienceYears < 0) {
        setError("Experience years cannot be negative");
        return;
      }

      const formData = new FormData();

      formData.append("fullName", form.fullName.trim());
      formData.append("phone", form.phone.trim());
      formData.append("address", form.address.trim());
      formData.append("city", form.city.trim());
      formData.append("bio", form.bio.trim());
      formData.append("availability", form.availability.trim());
      formData.append("companyName", form.companyName.trim());
      formData.append("companyDescription", form.companyDescription.trim());
      formData.append("experienceLevel", form.experienceLevel);
      formData.append("experienceYears", String(Number(form.experienceYears) || 0));
      formData.append("skills", JSON.stringify(form.skills));
      formData.append(
        "workingHours",
        JSON.stringify({
          startHour: Number(form.workingHours.startHour),
          endHour: Number(form.workingHours.endHour),
        })
      );

      if (imageFile) {
        formData.append("profileImage", imageFile);
      }

      const data = await apiFetch<{
        success: boolean;
        user: User;
        message?: string;
      }>("/users/me", {
        method: "PUT",
        body: formData,
      });

      setSuccess(data.message || "Profile updated successfully");

      if (data.user?.profileImage) {
        setForm((prev) => ({
          ...prev,
          profileImage: data.user.profileImage || "",
        }));
        setImagePreview(data.user.profileImage);
        setImageFile(null);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-8 md:px-10 xl:px-12">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-500">Loading profile form...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 md:px-10 xl:px-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/provider/me"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Back to Profile
            </Link>

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Provider Account
            </p>
            <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
              Edit Profile
            </h1>
            <p className="mt-2 text-lg text-slate-500">
              Update your professional details, profile photo, and working hours.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Basic Information
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
              <label className="mb-4 block text-sm font-semibold text-slate-700">
                Profile Image
              </label>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-sm">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Profile preview"
                      fill
                      unoptimized={imagePreview.startsWith("blob:")}
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <UserIcon size={32} />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600">
                    <Upload size={16} />
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageChange(e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </label>

                  <p className="mt-2 text-sm text-slate-500">
                    Upload a clear profile photo. Recommended square image, max
                    5MB.
                  </p>

                  {imageFile ? (
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      Selected: {imageFile.name}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Full Name"
                value={form.fullName}
                onChange={(value) => handleChange("fullName", value)}
              />

              <InputField label="Email" value={email} disabled />

              <InputField
                label="Phone"
                value={form.phone}
                onChange={(value) => handleChange("phone", value)}
              />

              <InputField
                label="Address"
                value={form.address}
                onChange={(value) => handleChange("address", value)}
              />

              <InputField
                label="City"
                value={form.city}
                onChange={(value) => handleChange("city", value)}
              />

              <div className="md:col-span-2">
                <TextareaField
                  label="Bio"
                  value={form.bio}
                  onChange={(value) => handleChange("bio", value)}
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Professional Information
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <InputField
                label="Skills (comma separated)"
                value={form.skills.join(", ")}
                onChange={handleSkillsChange}
              />
            </div>

            <SelectField
              label="Experience Level"
              value={form.experienceLevel}
              onChange={(value) =>
                handleChange(
                  "experienceLevel",
                  value as "" | "beginner" | "intermediate" | "expert"
                )
              }
              options={[
                { label: "Select level", value: "" },
                { label: "Beginner", value: "beginner" },
                { label: "Intermediate", value: "intermediate" },
                { label: "Expert", value: "expert" },
              ]}
            />

            <InputField
              label="Experience Years"
              type="number"
              value={String(form.experienceYears)}
              onChange={(value) =>
                handleChange("experienceYears", Number(value))
              }
            />

            <InputField
              label="Availability"
              value={form.availability}
              onChange={(value) => handleChange("availability", value)}
            />

            <InputField
              label="Company Name"
              value={form.companyName}
              onChange={(value) => handleChange("companyName", value)}
            />

            <div className="md:col-span-2">
              <TextareaField
                label="Company Description"
                value={form.companyDescription}
                onChange={(value) => handleChange("companyDescription", value)}
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Working Hours
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Start Hour (0-23)"
              type="number"
              value={String(form.workingHours.startHour)}
              onChange={(value) =>
                handleWorkingHourChange("startHour", Number(value))
              }
            />

            <InputField
              label="End Hour (1-24)"
              type="number"
              value={String(form.workingHours.endHour)}
              onChange={(value) =>
                handleWorkingHourChange("endHour", Number(value))
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option.value || "empty"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}