import Sidebar from "@/components/dashboard/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50">
      <Sidebar />
      <section className="ml-[260px] min-h-screen">
        {children}
      </section>
    </main>
  );
}