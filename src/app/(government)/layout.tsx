import GovSidebar from '@/components/layout/gov-sidebar';

export default function GovernmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#030712] text-white">
      {/* Sidebar for government layout */}
      <GovSidebar />

      {/* Main Content Area - offset for sidebar */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
