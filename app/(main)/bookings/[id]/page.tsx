"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Phone,
  Wallet,
  FileText,
  Clock3,
  ArrowLeft,
  Star,
  User,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type UserType = {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  profileImage?: string;
  averageRating?: number;
  totalReviews?: number;
};

type Booking = {
  _id: string;
  serviceTitle: string;
  description?: string;
  bookingDate: string;
  endTime?: string;
  durationMinutes?: number;
  address: string;
  city: string;
  phone: string;
  price: number;
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "in_progress"
    | "completed"
    | "cancelled";
  notes?: string;
  seeker?: UserType;
  provider?: UserType;
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

export default function SeekerBookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = String(params.id);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [bookingReview, setBookingReview] = useState<Review | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [existingReviewLoading, setExistingReviewLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const shouldOpenReview = searchParams.get("review") === "1";

  const loadPage = async () => {
    try {
      setPageLoading(true);
      setExistingReviewLoading(true);
      setError("");

      const [bookingData, reviewableData] = await Promise.all([
        apiFetch<{ booking: Booking }>(`/bookings/${bookingId}`),
        apiFetch<{ bookings: Booking[] }>("/reviews/my-reviewable-bookings").catch(
          () => ({ bookings: [] })
        ),
      ]);

      const fetchedBooking = bookingData.booking || null;
      setBooking(fetchedBooking);

      const reviewableIds = new Set(
        (reviewableData.bookings || []).map((b) => b._id)
      );
      setCanReview(reviewableIds.has(bookingId));

      if (fetchedBooking?.provider?._id) {
        try {
          const providerReviewsData = await apiFetch<{
            success: boolean;
            reviews: Review[];
          }>(`/reviews/provider/${fetchedBooking.provider._id}`);

          const matchedReview =
            (providerReviewsData.reviews || []).find(
              (review) => String(review.booking?._id) === String(bookingId)
            ) || null;

          setBookingReview(matchedReview);

          if (matchedReview) {
            setCanReview(false);
          }
        } catch {
          setBookingReview(null);
        }
      } else {
        setBookingReview(null);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load booking details";
      setError(message);
    } finally {
      setPageLoading(false);
      setExistingReviewLoading(false);
    }
  };

  useEffect(() => {
    void loadPage();
  }, [bookingId]);

  const submitReview = async () => {
    try {
      setReviewLoading(true);
      setSubmitError("");
      setSubmitSuccess("");

      await apiFetch<{ success: boolean; review: Review }>("/reviews", {
        method: "POST",
        body: JSON.stringify({
          bookingId,
          rating,
          comment,
        }),
      });

      setSubmitSuccess("Review submitted successfully.");
      setCanReview(false);

      await loadPage();

      setTimeout(() => {
        router.replace(`/bookings/${bookingId}`);
      }, 800);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit review";
      setSubmitError(message);
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-purple-100 text-purple-700";
      case "cancelled":
        return "bg-slate-200 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formattedDuration = useMemo(() => {
    if (!booking?.durationMinutes) return "Not available";
    const hours = Math.floor(booking.durationMinutes / 60);
    const minutes = booking.durationMinutes % 60;

    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  }, [booking?.durationMinutes]);

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-8 py-10 md:px-10 xl:px-12">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-500">Loading booking details...</p>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-slate-50 px-8 py-10 md:px-10 xl:px-12">
        <div className="mx-auto max-w-6xl rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600 shadow-sm">
          {error || "Could not load booking"}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-10 md:px-10 xl:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/bookings"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft size={16} />
              Back to Bookings
            </Link>

            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Booking Details
            </p>
            <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
              {booking.serviceTitle}
            </h1>
            <p className="mt-2 text-lg text-slate-500">
              Full schedule, provider info, booking summary, and review status in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${getStatusClasses(
                booking.status
              )}`}
            >
              {booking.status.replace("_", " ")}
            </span>

            {canReview && (
              <a
                href="#review-form"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Star size={16} />
                Write Review
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-8">
            <Section title="Booking Summary">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoCard
                  icon={<CalendarDays size={18} />}
                  label="Booking Date"
                  value={new Date(booking.bookingDate).toLocaleString()}
                />
                <InfoCard
                  icon={<Clock3 size={18} />}
                  label="Duration"
                  value={formattedDuration}
                />
                <InfoCard
                  icon={<MapPin size={18} />}
                  label="Address"
                  value={`${booking.address}, ${booking.city}`}
                />
                <InfoCard
                  icon={<Phone size={18} />}
                  label="Phone"
                  value={booking.phone}
                />
                <InfoCard
                  icon={<Wallet size={18} />}
                  label="Price"
                  value={`Rs. ${booking.price}`}
                />
                <InfoCard
                  icon={<CheckCircle2 size={18} />}
                  label="Status"
                  value={booking.status.replace("_", " ")}
                />
              </div>

              {booking.description && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-700">
                    <FileText size={18} />
                    <span className="font-semibold">Description</span>
                  </div>
                  <p className="text-slate-500">{booking.description}</p>
                </div>
              )}

              {booking.notes && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-700">
                    <FileText size={18} />
                    <span className="font-semibold">Notes</span>
                  </div>
                  <p className="text-slate-500">{booking.notes}</p>
                </div>
              )}
            </Section>

            <Section title="Review for This Booking">
              {existingReviewLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Loading booking review...
                </div>
              ) : bookingReview ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      {bookingReview.seeker?.profileImage ? (
                        <img
                          src={bookingReview.seeker.profileImage}
                          alt={bookingReview.seeker.fullName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                          {(bookingReview.seeker?.fullName || "U")
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {bookingReview.seeker?.fullName || "Customer"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {bookingReview.createdAt
                            ? new Date(bookingReview.createdAt).toLocaleString()
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
                            value <= bookingReview.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300"
                          }
                        />
                      ))}
                      <span className="ml-2 text-sm font-semibold text-slate-700">
                        {bookingReview.rating}/5
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-white p-4">
                    <p className="text-sm leading-7 text-slate-700">
                      {bookingReview.comment?.trim()
                        ? bookingReview.comment
                        : "You left a rating without a written comment."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                    <MessageSquare className="text-slate-500" size={22} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    No review yet
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Once a review is submitted for this booking, it will appear here.
                  </p>
                </div>
              )}
            </Section>

            {canReview && (
              <Section title="Leave a Review">
                <div
                  id="review-form"
                  className={`rounded-2xl border p-5 ${
                    shouldOpenReview
                      ? "border-blue-200 bg-blue-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="text-sm text-slate-600">
                    This booking is completed, so you can now rate the provider and write a review.
                  </p>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Rating
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                            rating === value
                              ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <Star
                            size={16}
                            className={
                              rating >= value
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300"
                            }
                          />
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Comment
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={5}
                      placeholder="Tell others about your experience..."
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  {submitError && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {submitError}
                    </div>
                  )}

                  {submitSuccess && (
                    <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {submitSuccess}
                    </div>
                  )}

                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={submitReview}
                      disabled={reviewLoading}
                      className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Star size={16} />
                      {reviewLoading ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </div>
              </Section>
            )}
          </div>

          <div className="space-y-8">
            <Section title="Provider Information">
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-start gap-4">
                  {booking.provider?.profileImage ? (
                    <img
                      src={booking.provider.profileImage}
                      alt={booking.provider.fullName}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
                      <User size={28} />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-slate-900">
                      {booking.provider?.fullName || "Provider"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {booking.provider?.city || "Location not available"}
                    </p>

                    {typeof booking.provider?.averageRating === "number" &&
                      booking.provider?.totalReviews !== undefined && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                          <Star
                            size={16}
                            className="fill-yellow-400 text-yellow-400"
                          />
                          <span className="font-semibold text-slate-900">
                            {booking.provider.averageRating.toFixed(1)}
                          </span>
                          <span>
                            ({booking.provider.totalReviews} review
                            {booking.provider.totalReviews === 1 ? "" : "s"})
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3">
                  <MiniInfoRow
                    icon={<Phone size={16} />}
                    text={booking.provider?.phone || "Phone not available"}
                  />
                  <MiniInfoRow
                    icon={<MapPin size={16} />}
                    text={booking.provider?.address || "Address not available"}
                  />
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function InfoCard({
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
      <div className="mb-2 flex items-center gap-2 text-slate-700">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <p className="text-sm leading-6 text-slate-500">{value}</p>
    </div>
  );
}

function MiniInfoRow({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <span className="text-slate-500">{icon}</span>
      <span>{text}</span>
    </div>
  );
}