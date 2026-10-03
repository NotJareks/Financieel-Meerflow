import { requireAdmin } from "@/lib/auth-guards";
import { Navbar } from "@/components/navbar";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        user={{ name: user.name ?? null, email: user.email, role: user.role }}
      />
      <main className="mx-auto w-[min(1440px,calc(100%-40px))] flex-1 animate-page-fade py-10 md:py-16">
        <AdminNav />
        {children}
      </main>
    </div>
  );
}
