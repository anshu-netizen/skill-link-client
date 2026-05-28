"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Phone,
  Wallet,
  Clock3,
  User,
  Briefcase,
  FileText,
  ShieldCheck,
  BadgeCheck,
  Star,
  MessageSquare,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const BookingLocationMap = dynamic(
  () => import("@/components/booking/BookingLocationMap"),
  {
    ssr: false,
  }
);

type Person = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  profileImage?: string;
};

type Provider = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  isActive?: boolean;
  isVerified?: boolean;
  averageRating?: number;
  totalReviews?: number;
  workingHours?: {
    startHour: number;
    endHour: number;
  };
};

type Booking = {
  _id: string;
  seeker: Person;
  provider: Provider;
  serviceTitle: string;
  description?: string;
  bookingDate: string;
  endTime: string;
  durationMinutes: number;
  address?: string;
  city?: string;
  phone?: string;
  price?: number;
  lat?: number;
  lng?: number;
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "completed"
    | "in_progress"
    | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type Review = {
  _id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  seeker?: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
  booking?: {
    _id: string;
    serviceTitle?: string;
    bookingDate?: string;
  };
};

export default function BookingDetailsPage() {
  const params = useParams();
  const bookingId = String(params.id);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookingAndReviews = async () => {
      try {
        setLoading(true);
        setReviewsLoading(true);

        const bookingData = await apiFetch<{ success: boolean; booking: Booking }>(
          `/bookings/${bookingId}`
        );

        const fetchedBooking = bookingData.booking;
        setBooking(fetchedBooking);

        try {
          const reviewsData = await apiFetch<{
            success: boolean;
            reviews: Review[];
          }>(`/reviews/provider/${fetchedBooking.provider._id}`);

          const matchedReviews = (reviewsData.reviews || []).filter(
            (review) => String(review.booking?._id) === String(fetchedBooking._id)
          );

          setReviews(matchedReviews);
        } catch {
          setReviews([]);
        } finally {
          setReviewsLoading(false);
        }
      } catch {
        setError("Failed to load booking details");
        setReviewsLoading(false);
      } finally {
        setLoading(false);
      }
    };

    void fetchBookingAndReviews();
  }, [bookingId]);

  const getStatusClasses = (status: Booking["status"]) => {
    switch (status) {
      case "accepted":
        return "text-green-700 ring-green-200";
      case "pending":
        return "text-amber-700 ring-amber-200";
      case "rejected":
        return "text-red-700 ring-red-200";
      case "completed":
        return "text-blue-700 ring-blue-200";
      case "in_progress":
        return "text-purple-700 ring-purple-200";
      case "cancelled":
        return "text-slate-700 ring-slate-300";
      default:
        return "text-slate-700 ring-slate-200";
    }
  };

  const averageBookingReviewRating = useMemo(() => {
    if (!reviews.length) return null;
    const avg =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    return avg.toFixed(1);
  }, [reviews]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-base font-medium text-slate-700">
            Loading booking details...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          {error}
        </div>
      </main>
    );
  }

  if (!booking) return null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-xl">
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-100">
                  Booking Details
                </p>

                <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">
                  {booking.serviceTitle}
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100">
                  {booking.description ||
                    "No description provided for this booking."}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span
                    className={`rounded-full bg-white px-4 py-2 text-sm font-bold ring-1 ${getStatusClasses(
                      booking.status
                    )}`}
                  >
                    {booking.status.replace("_", " ")}
                  </span>

                  <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                    {booking.durationMinutes} min
                  </span>

                  <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                    Rs. {booking.price ?? 0}
                  </span>

                  {reviews.length > 0 && averageBookingReviewRating && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                      <Star size={15} className="fill-yellow-300 text-yellow-300" />
                      {averageBookingReviewRating} review rating
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <HeroInfoCard
                  label="Booking Date"
                  value={new Date(booking.bookingDate).toLocaleDateString([], {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                />
                <HeroInfoCard
                  label="Start Time"
                  value={new Date(booking.bookingDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
                <HeroInfoCard
                  label="End Time"
                  value={new Date(booking.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
                <HeroInfoCard label="City" value={booking.city || "Not set"} />
              </div>
            </div>
          </div>
        </section>

        <BookingStatusTimeline status={booking.status} />

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle
                icon={<Briefcase size={20} />}
                title="Booking Overview"
                subtitle="Main booking information"
              />

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailCard label="Service Title" value={booking.serviceTitle} />
                <DetailCard
                  label="Status"
                  value={booking.status.replace("_", " ")}
                />
                <DetailCard
                  label="Price"
                  value={`Rs. ${booking.price ?? 0}`}
                />
                <DetailCard
                  label="Duration"
                  value={`${booking.durationMinutes} minutes`}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Description
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {booking.description || "No description provided."}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <FileText size={18} />
                  <p className="text-sm font-semibold">Notes</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {booking.notes || "No notes added."}
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle
                icon={<CalendarDays size={20} />}
                title="Time & Location"
                subtitle="When and where this job is scheduled"
              />

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoTile
                  icon={<CalendarDays size={18} />}
                  label="Start Time"
                  value={new Date(booking.bookingDate).toLocaleString()}
                />
                <InfoTile
                  icon={<Clock3 size={18} />}
                  label="End Time"
                  value={new Date(booking.endTime).toLocaleString()}
                />
                <InfoTile
                  icon={<MapPin size={18} />}
                  label="Address"
                  value={booking.address || "Not provided"}
                />
                <InfoTile
                  icon={<MapPin size={18} />}
                  label="City"
                  value={booking.city || "Not provided"}
                />
                <InfoTile
                  icon={<MapPin size={18} />}
                  label="Latitude"
                  value={
                    booking.lat !== undefined ? String(booking.lat) : "Not provided"
                  }
                />
                <InfoTile
                  icon={<MapPin size={18} />}
                  label="Longitude"
                  value={
                    booking.lng !== undefined ? String(booking.lng) : "Not provided"
                  }
                />
              </div>

              {booking.lat !== undefined && booking.lng !== undefined && (
                <div className="mt-6">
                  <p className="mb-3 text-sm font-semibold text-slate-900">
                    Map Preview
                  </p>
                  <BookingLocationMap
                    lat={booking.lat}
                    lng={booking.lng}
                    address={booking.address}
                    city={booking.city}
                  />
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle
                icon={<User size={20} />}
                title="Customer Information"
                subtitle="The person who created this booking"
              />

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoTile
                  icon={<User size={18} />}
                  label="Full Name"
                  value={booking.seeker.fullName}
                />
                <InfoTile
                  icon={<Phone size={18} />}
                  label="Phone"
                  value={booking.seeker.phone || "Not provided"}
                />
                <InfoTile
                  icon={<Phone size={18} />}
                  label="Email"
                  value={booking.seeker.email}
                />
                <InfoTile
                  icon={<MapPin size={18} />}
                  label="City"
                  value={booking.seeker.city || "Not provided"}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Customer Address
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {booking.seeker.address || "Not provided"}
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle
                icon={<MessageSquare size={20} />}
                title="Review for This Booking"
                subtitle="Customer feedback linked to this specific job"
              />

              {reviewsLoading ? (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Loading booking reviews...
                </div>
              ) : reviews.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-3">
                          {review.seeker?.profileImage ? (
                            <img
                              src={review.seeker.profileImage}
                              alt={review.seeker.fullName}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                              {(review.seeker?.fullName || "U")
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {review.seeker?.fullName || "Customer"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {review.createdAt
                                ? new Date(review.createdAt).toLocaleString()
                                : "Recently"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <Star
                              key={value}
                              size={16}
                              className={
                                value <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-300"
                              }
                            />
                          ))}
                          <span className="ml-2 text-sm font-semibold text-slate-700">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl bg-white p-4">
                        <p className="text-sm leading-7 text-slate-700">
                          {review.comment?.trim()
                            ? review.comment
                            : "A rating was given without a written comment."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                    <MessageSquare className="text-slate-500" size={22} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    No review for this booking yet
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Once the customer leaves feedback for this completed booking, it will show up here.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6 xl:col-span-4">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle
                icon={<BadgeCheck size={20} />}
                title="Assigned Provider"
                subtitle="Small summary for your account"
              />

              <div className="mt-6 space-y-4">
                <InfoRow label="Name" value={booking.provider.fullName} />
                <InfoRow label="Email" value={booking.provider.email} />
                <InfoRow
                  label="Phone"
                  value={booking.provider.phone || "Not provided"}
                />
                <InfoRow
                  label="Verified"
                  value={booking.provider.isVerified ? "Yes" : "No"}
                />
                <InfoRow
                  label="Active"
                  value={booking.provider.isActive ? "Yes" : "No"}
                />
                <InfoRow
                  label="Working Hours"
                  value={
                    booking.provider.workingHours
                      ? `${booking.provider.workingHours.startHour}:00 - ${booking.provider.workingHours.endHour}:00`
                      : "Not provided"
                  }
                />
                <InfoRow
                  label="Average Rating"
                  value={
                    typeof booking.provider.averageRating === "number"
                      ? `${booking.provider.averageRating.toFixed(1)}`
                      : "No ratings yet"
                  }
                />
                <InfoRow
                  label="Total Reviews"
                  value={String(booking.provider.totalReviews ?? 0)}
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle
                icon={<Wallet size={20} />}
                title="Payment & Contact"
                subtitle="Quick reference details"
              />

              <div className="mt-6 space-y-4">
                <InfoRow label="Price" value={`Rs. ${booking.price ?? 0}`} />
                <InfoRow
                  label="Booking Phone"
                  value={booking.phone || "Not provided"}
                />
                <InfoRow
                  label="Status"
                  value={booking.status.replace("_", " ")}
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
              <SectionTitleDark
                icon={<ShieldCheck size={20} />}
                title="Metadata"
                subtitle="Booking timestamps"
              />

              <div className="mt-6 space-y-4">
                <DarkInfoRow
                  label="Created At"
                  value={new Date(booking.createdAt).toLocaleString()}
                />
                <DarkInfoRow
                  label="Updated At"
                  value={new Date(booking.updatedAt).toLocaleString()}
                />
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function HeroInfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
        {label}
      </p>
      <p className="mt-3 text-xl font-bold leading-snug text-white">{value}</p>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-slate-950">{title}</h2>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>
    </div>
  );
}

function SectionTitleDark({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-white">{title}</h2>
        <p className="text-sm text-slate-300">{subtitle}</p>
      </div>
    </div>
  );
}

function DetailCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-900">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <p className="text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function DarkInfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-300">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

const timelineSteps = [
  { key: "pending", label: "Pending", helper: "Request received" },
  { key: "accepted", label: "Accepted", helper: "You approved it" },
  { key: "in_progress", label: "In Progress", helper: "Work started" },
  { key: "completed", label: "Completed", helper: "Ready for review" },
] as const;

function BookingStatusTimeline({ status }: { status: Booking["status"] }) {
  const currentIndex = timelineSteps.findIndex((step) => step.key === status);
  const isStopped = status === "rejected" || status === "cancelled";

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Booking Timeline
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
            Status progress
          </h2>
        </div>
        <span className="w-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-bold capitalize text-slate-700">
          {status.replace("_", " ")}
        </span>
      </div>

      {isStopped ? (
        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          This booking was {status}. The regular job progress has stopped.
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        {timelineSteps.map((step, index) => {
          const done = !isStopped && currentIndex >= index;
          const active = !isStopped && currentIndex === index;

          return (
            <div
              key={step.key}
              className={`rounded-2xl border p-4 transition ${
                done
                  ? "border-blue-200 bg-blue-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold ${
                    done ? "bg-blue-600 text-white" : "bg-white text-slate-400"
                  }`}
                >
                  {done ? "✓" : index + 1}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{step.label}</p>
                  <p className="text-xs text-slate-500">{step.helper}</p>
                </div>
              </div>
              {active ? (
                <p className="mt-3 text-xs font-semibold text-blue-700">
                  Current stage
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
