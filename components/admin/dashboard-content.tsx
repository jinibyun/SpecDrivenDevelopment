"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import {
  BOOKINGS,
  TODAY_ISO,
  getCustomer,
  getService,
  type Booking,
  type BookingStatus,
} from "@/lib/mock-data";
import { formatPrice, formatDateTimeShort } from "@/lib/format";

const TABS: { key: "all" | BookingStatus; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "pending", label: "대기" },
  { key: "confirmed", label: "확정" },
  { key: "completed", label: "완료" },
  { key: "no_show", label: "노쇼" },
];

export function DashboardContent() {
  const [bookings, setBookings] = useState<Booking[]>(BOOKINGS);
  const [tab, setTab] = useState<"all" | BookingStatus>("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function patch(id: string, status: BookingStatus, message: string) {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  const todays = bookings.filter((b) => b.scheduledAt.slice(0, 10) === TODAY_ISO);
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const weekDone = bookings.filter((b) => b.status === "completed" || b.status === "no_show");
  const noShowCount = bookings.filter((b) => b.status === "no_show").length;
  const noShowRate = weekDone.length ? Math.round((noShowCount / weekDone.length) * 100) : 0;
  const customerCount = new Set(bookings.map((b) => b.customerId)).size;

  const stats = [
    { label: "오늘 예약", value: String(todays.length), unit: "건", delta: "어제 대비 +2건", accent: false },
    { label: "승인 대기", value: String(pendingCount), unit: "건", delta: "가장 오래된 건 2시간 경과", accent: true },
    { label: "이번주 노쇼율", value: `${noShowRate}%`, unit: "", delta: `완료 ${weekDone.length}건 중 ${noShowCount}건`, accent: false },
    { label: "총 고객수", value: String(customerCount), unit: "명", delta: "이번주 신규 3명", accent: false },
  ];

  const filtered = useMemo(() => {
    const q = query.trim();
    return bookings
      .filter((b) => tab === "all" || b.status === tab)
      .filter((b) => {
        if (!q) return true;
        const customer = getCustomer(b.customerId);
        return customer.name.includes(q) || customer.phone.includes(q);
      })
      .sort((a, b) => (a.scheduledAt < b.scheduledAt ? 1 : -1));
  }, [bookings, tab, query]);

  return (
    <div>
      <div className="mb-6.5 flex items-end justify-between gap-5">
        <div>
          <h1 className="mb-1.25 text-[22px] font-bold tracking-tight">대시보드</h1>
          <p className="text-[13.5px] text-[#71717A]">2026년 8월 18일 (화) 기준 예약 현황입니다.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="h-9.5 rounded-lg px-3.75 text-[13px] font-semibold">
            내보내기
          </Button>
          <Button type="button" className="h-9.5 rounded-lg bg-[#5B8CFF] px-3.75 text-[13px] font-semibold text-white hover:bg-[#5B8CFF]/90">
            예약 추가
          </Button>
        </div>
      </div>

      <div className="mb-7.5 grid grid-cols-4 gap-3.5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-[#E4E4E7] bg-white px-4.5 py-4.25">
            <div className="mb-2.25 text-[12.5px] text-[#71717A]">{s.label}</div>
            <div className="flex items-baseline gap-1.25">
              <span className={cn("text-[26px] font-bold tracking-tight", s.accent && "text-[#5B8CFF]")}>{s.value}</span>
              <span className="text-[13px] text-[#A1A1AA]">{s.unit}</span>
            </div>
            <div className={cn("mt-1.75 text-[11.5px]", s.accent ? "font-medium text-[#3F6FE0]" : "text-[#A1A1AA]")}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="mb-3.5 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-[10px] bg-[#F4F4F5] p-0.75">
          {TABS.map((t) => {
            const active = tab === t.key;
            const count = t.key === "all" ? bookings.length : bookings.filter((b) => b.status === t.key).length;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex h-7.5 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition-colors",
                  active ? "bg-white text-[#09090B] shadow-sm" : "text-[#71717A]"
                )}
              >
                <span>{t.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-px text-[11px] font-bold",
                    active ? "bg-[#5B8CFF]/13 text-[#3F6FE0]" : "bg-[#E9E9EC] text-[#A1A1AA]"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="고객명 검색"
          className="ml-auto h-9 w-52.5 rounded-lg px-3 text-[13px]"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E4E4E7]">
        <div className="grid grid-cols-[1.1fr_1.1fr_1.3fr_0.8fr_minmax(160px,1fr)] gap-4 border-b border-[#EFEFF2] bg-[#FAFAFA] px-4.5 py-2.75 text-xs font-semibold text-[#71717A]">
          <span>고객명</span>
          <span>서비스</span>
          <span>일시</span>
          <span>상태</span>
          <span className="text-right">액션</span>
        </div>

        {filtered.map((b, i) => {
          const customer = getCustomer(b.customerId);
          const service = getService(b.serviceId);
          const day = b.scheduledAt.slice(0, 10);
          const rel = day === TODAY_ISO ? "오늘" : day === "2026-08-17" ? "어제" : day;

          return (
            <div
              key={b.id}
              className={cn(
                "grid grid-cols-[1.1fr_1.1fr_1.3fr_0.8fr_minmax(160px,1fr)] items-center gap-4 bg-white px-4.5 py-3.5",
                i !== filtered.length - 1 && "border-b border-[#F4F4F5]"
              )}
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[13.5px] font-semibold">{customer.name}</span>
                <span className="text-[11.5px] text-[#A1A1AA]">{customer.phone}</span>
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[13px]">{service.name}</span>
                <span className="text-[11.5px] text-[#A1A1AA]">
                  {service.durationMinutes}분 · {formatPrice(service.price)}
                </span>
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[13px]">{formatDateTimeShort(b.scheduledAt)}</span>
                <span className="text-[11.5px] text-[#A1A1AA]">{rel}</span>
              </div>
              <div>
                <StatusBadge status={b.status} />
              </div>
              <div className="flex justify-end gap-1.5">
                {b.status === "pending" && (
                  <>
                    <ActionButton kind="primary" onClick={() => patch(b.id, "confirmed", `${customer.name} 님 예약을 확정했습니다.`)}>
                      승인
                    </ActionButton>
                    <ActionButton kind="danger" onClick={() => patch(b.id, "cancelled", `${customer.name} 님 예약을 취소했습니다.`)}>
                      취소
                    </ActionButton>
                  </>
                )}
                {b.status === "confirmed" && (
                  <>
                    <ActionButton kind="ghost" onClick={() => patch(b.id, "completed", `${customer.name} 님 예약을 완료 처리했습니다.`)}>
                      완료
                    </ActionButton>
                    <ActionButton kind="danger" onClick={() => patch(b.id, "no_show", `${customer.name} 님을 노쇼로 기록했습니다.`)}>
                      노쇼
                    </ActionButton>
                  </>
                )}
                {b.status !== "pending" && b.status !== "confirmed" && (
                  <span className="text-xs text-[#C4C4CC]">—</span>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="px-4 py-11 text-center text-[13px] text-[#A1A1AA]">해당하는 예약이 없습니다.</div>
        )}

        <div className="flex items-center justify-between border-t border-[#EFEFF2] bg-[#FAFAFA] px-4.5 py-3">
          <span className="text-xs text-[#A1A1AA]">
            {filtered.length}건 표시 · 전체 {bookings.length}건
          </span>
        </div>
      </div>

      {toast && (
        <div className="fixed right-7 bottom-6.5 animate-in fade-in slide-in-from-bottom-1 rounded-[10px] bg-[#0F1117] px-4 py-3 text-[13px] font-medium text-white shadow-[0_10px_30px_rgba(9,9,11,0.22)] duration-200">
          {toast}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  kind,
  onClick,
  children,
}: {
  kind: "primary" | "ghost" | "danger";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-7.5 flex-none rounded-lg px-2.75 text-[12.5px] font-semibold whitespace-nowrap transition-opacity hover:opacity-80",
        kind === "primary" && "border-none bg-[#5B8CFF] text-white",
        kind === "danger" && "border border-[#F3D3D0] bg-white text-[#B42318]",
        kind === "ghost" && "border border-[#E4E4E7] bg-white text-[#09090B]"
      )}
    >
      {children}
    </button>
  );
}
