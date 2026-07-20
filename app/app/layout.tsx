import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Header } from "@/components/layout/Header";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-brand-cream">
      <AppSidebar />
      <div className="flex min-h-screen w-full flex-1 flex-col">
        <Header />
        <main className="app-shell flex min-h-0 flex-1 flex-col pb-24 lg:pb-0">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
