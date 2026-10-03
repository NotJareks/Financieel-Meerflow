"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarRange,
  ClipboardList,
  Shield,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type NavUser = {
  name: string | null;
  email: string;
  role: "ADMIN" | "USER";
};

const NAV_ITEMS = [
  { href: "/", label: "Overzicht", icon: LayoutDashboard, exact: true },
  { href: "/budget", label: "Mijn maandbudget", icon: ClipboardList },
  { href: "/actual-budget", label: "Werkelijk maandbudget", icon: CalendarRange },
];

export function Navbar({ user }: { user: NavUser }) {
  const pathname = usePathname();

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-[18px]">
      <div className="mx-auto flex min-h-[78px] w-[min(1440px,calc(100%-40px))] flex-wrap items-center gap-3 py-3">
        <Link href="/" className="mr-auto flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center border border-accent/45 font-serif text-xl text-accent">
            M
          </div>
          <div className="leading-tight">
            <div className="text-[0.95rem] font-semibold">Mijn Financiën</div>
            <div className="hidden text-[0.68rem] text-muted-foreground sm:block">
              Persoonlijk financieel overzicht
            </div>
          </div>
        </Link>

        <nav className="order-3 flex w-full items-center gap-2 overflow-x-auto lg:order-none lg:w-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-[10px] px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
                isActive(item.href, item.exact) && "bg-white/5 text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-[10px] px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
                pathname.startsWith("/admin") && "bg-white/5 text-accent"
              )}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
            <span className="h-[7px] w-[7px] rounded-full bg-success" />
            Veilig opgeslagen
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-2 text-sm outline-none transition-colors hover:bg-white/[0.07]">
              <span className="max-w-[140px] truncate">
                {user.name || user.email}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {user.name || "Gebruiker"}
                  </span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="text-muted-foreground" />
                Uitloggen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
