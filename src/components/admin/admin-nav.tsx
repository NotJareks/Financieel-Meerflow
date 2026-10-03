"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, KeyRound, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/invites", label: "Uitnodigingen", icon: KeyRound },
  { href: "/admin/users", label: "Gebruikers", icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="mb-12">
      <span className="eyebrow">BEHEER</span>
      <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] leading-none">Admin</h1>

      <nav className="mt-6 flex gap-2 overflow-x-auto border-b border-border pb-px">
        {ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors",
                active
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
