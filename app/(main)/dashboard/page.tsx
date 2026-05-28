"use client";

import { useMemo, useState } from "react";
import TopHero from "@/components/dashboard/TopHero";
import FeatureCards from "@/components/dashboard/FeatureCards";
import ExpertGrid from "@/components/dashboard/ExpertGrid";

export default function DashboardPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const normalizedSearch = useMemo(() => searchTerm.trim(), [searchTerm]);

  const handleReset = () => {
    setSearchInput("");
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopHero
        search={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={() => setSearchTerm(searchInput)}
        onReset={handleReset}
      />

      <div className="-mt-12 px-8 pb-10 md:px-10 xl:px-12">
        <FeatureCards />
        <ExpertGrid searchTerm={normalizedSearch} />
      </div>
    </div>
  );
}