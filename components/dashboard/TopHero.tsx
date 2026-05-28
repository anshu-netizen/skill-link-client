"use client";

import { Search, X } from "lucide-react";

type TopHeroProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: () => void;
  onReset?: () => void;
};

export default function TopHero({
  search,
  onSearchChange,
  onSearchSubmit,
  onReset,
}: TopHeroProps) {
  return (
    <section className="rounded-bl-[48px] bg-[#0F4AA1] px-8 pb-24 pt-14 text-white md:px-10 xl:px-12">
      <div className="max-w-6xl">
        <h1 className="max-w-3xl text-5xl font-extrabold leading-tight md:text-6xl">
          Find your next expert
        </h1>

        <p className="mt-4 max-w-3xl text-lg text-blue-100 md:text-2xl">
          Search deals on professional services, experts, and much more...
        </p>

        <div className="mt-8 flex max-w-5xl overflow-hidden rounded-2xl border-4 border-yellow-400 bg-white shadow-xl">
          
          {/* INPUT */}
          <div className="flex flex-1 items-center gap-3 px-5">
            <Search className="text-slate-400" size={22} />

            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && onSearchSubmit) {
                  onSearchSubmit();
                }
              }}
              placeholder="Search skills, categories, or locations..."
              className="h-16 w-full bg-transparent text-lg text-slate-700 outline-none placeholder:text-slate-400"
            />

            {/* RESET BUTTON */}
            {search && (
              <button
                type="button"
                onClick={onReset}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* SEARCH BUTTON */}
          <button
            type="button"
            onClick={onSearchSubmit}
            className="bg-blue-500 px-8 text-lg font-bold text-white transition hover:bg-blue-600 md:px-10"
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
}