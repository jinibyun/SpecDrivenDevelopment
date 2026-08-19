"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SHOP_NAME } from "@/lib/mock-data";

const NAV_ITEMS = [
  { label: "대시보드", icon: "◧", href: "/admin/dashboard" },
  { label: "예약", icon: "▤", href: "/admin/dashboard" },
  { label: "고객", icon: "◍", href: "/admin/customers" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-59 flex-none flex-col bg-[#0F1117] px-3.5 py-5.5 text-white">
      <div className="flex items-center gap-2.5 px-2.5 pb-5.5">
        <div className="h-5.5 w-5.5 rounded-md bg-[#5B8CFF]" />
        <span className="text-[15px] font-bold tracking-tight">BookFlow</span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] transition-colors",
                active
                  ? "bg-white/9 font-semibold text-white"
                  : "font-medium text-white/60 hover:bg-white/9 hover:text-white"
              )}
            >
              <span className="w-4 text-center text-[13px] opacity-90">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        <span
          aria-disabled="true"
          className="flex h-9 w-full cursor-not-allowed items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] font-medium text-white/40"
        >
          <span className="w-4 text-center text-[13px] opacity-90">⚙</span>
          <span>설정</span>
        </span>
      </nav>

      <div className="mt-auto flex items-center gap-2.5 border-t border-white/9 pt-3.5">
        <div className="flex h-7.5 w-7.5 flex-none items-center justify-center rounded-full bg-[#5B8CFF]/20 text-xs font-bold text-[#A9C2FF]">
          {SHOP_NAME.slice(0, 1)}
        </div>
        <div className="flex min-w-0 flex-col gap-px">
          <span className="text-[12.5px] font-semibold">{SHOP_NAME}</span>
          <span className="text-[11px] text-white/42">admin@bookflow.app</span>
        </div>
      </div>
    </aside>
  );
}
