import { ShieldCheck, Zap, Globe, Heart } from "lucide-react";

const features = [
  {
    title: "Secure Payments",
    subtitle: "Pay only when the job is done",
    icon: ShieldCheck,
    color: "text-blue-500",
  },
  {
    title: "Instant Booking",
    subtitle: "1-hour buffer protection",
    icon: Zap,
    color: "text-orange-500",
  },
  {
    title: "Verified Pros",
    subtitle: "Background checked experts",
    icon: Globe,
    color: "text-green-500",
  },
  {
    title: "24/7 Support",
    subtitle: "We are always here to help",
    icon: Heart,
    color: "text-pink-500",
  },
];

export default function FeatureCards() {
  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {features.map((feature) => {
        const Icon = feature.icon;

        return (
          <div
            key={feature.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
              <Icon className={feature.color} size={24} />
            </div>

            <h3 className="text-2xl font-bold text-slate-900">
              {feature.title}
            </h3>

            <p className="mt-2 text-base leading-7 text-slate-500">
              {feature.subtitle}
            </p>
          </div>
        );
      })}
    </section>
  );
}