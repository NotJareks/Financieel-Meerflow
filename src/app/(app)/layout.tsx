import { requireUser } from "@/lib/auth-guards";
import { Navbar } from "@/components/navbar";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        user={{ name: user.name ?? null, email: user.email, role: user.role }}
      />
      <main className="mx-auto w-[min(1440px,calc(100%-40px))] flex-1 animate-page-fade py-10 md:py-16">
        {children}
      </main>
    </div>
  );
}
