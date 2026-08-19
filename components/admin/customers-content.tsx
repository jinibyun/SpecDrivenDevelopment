"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import { BOOKINGS, CUSTOMERS, getService, type Customer } from "@/lib/mock-data";
import { formatPrice, formatDateTimeFull } from "@/lib/format";

type EnrichedCustomer = Customer & {
  totalBookings: number;
  noShowCount: number;
  lastAt: string | null;
};

function enrich(customer: Customer): EnrichedCustomer {
  const bookings = BOOKINGS.filter((b) => b.customerId === customer.id).sort((a, b) =>
    a.scheduledAt < b.scheduledAt ? 1 : -1
  );
  return {
    ...customer,
    totalBookings: bookings.length,
    noShowCount: bookings.filter((b) => b.status === "no_show").length,
    lastAt: bookings[0]?.scheduledAt ?? null,
  };
}

export function CustomersContent() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const enriched = useMemo(() => CUSTOMERS.map(enrich), []);

  const filtered = useMemo(() => {
    const q = query.trim().replace(/-/g, "");
    return enriched
      .filter((c) => !q || c.name.includes(query.trim()) || c.phone.replace(/-/g, "").includes(q))
      .sort((a, b) => ((a.lastAt ?? "") < (b.lastAt ?? "") ? 1 : -1));
  }, [enriched, query]);

  const detail = enriched.find((c) => c.id === openId) ?? null;
  const detailBookings = detail
    ? BOOKINGS.filter((b) => b.customerId === detail.id).sort((a, b) => (a.scheduledAt < b.scheduledAt ? 1 : -1))
    : [];

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-5">
        <div>
          <h1 className="mb-1.25 text-[22px] font-bold tracking-tight">고객</h1>
          <p className="text-[13.5px] text-[#71717A]">
            등록 고객 {enriched.length}명 · 행을 클릭하면 예약 이력을 볼 수 있습니다.
          </p>
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름 또는 연락처 검색"
          className="h-9.5 w-62.5 rounded-lg px-3.25 text-[13px]"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E4E4E7]">
        <div className="grid grid-cols-[1.4fr_1.2fr_0.8fr_0.8fr_90px] gap-4 border-b border-[#EFEFF2] bg-[#FAFAFA] px-4.5 py-2.75 text-xs font-semibold text-[#71717A]">
          <span>이름</span>
          <span>연락처</span>
          <span className="text-right">총 예약수</span>
          <span className="text-right">노쇼 횟수</span>
          <span className="text-right">이력</span>
        </div>

        {filtered.map((c, i) => {
          const risky = c.noShowCount >= 2;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setOpenId(c.id)}
              className={cn(
                "grid w-full grid-cols-[1.4fr_1.2fr_0.8fr_0.8fr_90px] items-center gap-4 bg-white px-4.5 py-3.25 text-left",
                i !== filtered.length - 1 && "border-b border-[#F4F4F5]"
              )}
            >
              <div className="flex min-w-0 items-center gap-2.75">
                <Avatar name={c.name} />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[13.5px] font-semibold">{c.name}</span>
                  <span className="text-[11.5px] text-[#A1A1AA]">
                    {c.lastAt ? `최근 ${c.lastAt.slice(0, 10).replace(/-/g, ". ")}` : "예약 이력 없음"}
                  </span>
                </div>
              </div>
              <span className="text-[13px] text-[#52525B]">{c.phone}</span>
              <span className="text-right text-[13.5px] font-semibold">{c.totalBookings}</span>
              <div className="text-right">
                {c.noShowCount === 0 ? (
                  <span className="text-[13.5px] text-[#A1A1AA]">0</span>
                ) : (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.25 py-0.5 text-xs font-bold",
                      risky ? "bg-[#D92D20]/9 text-[#B42318]" : "bg-[#F4F4F5] text-[#52525B]"
                    )}
                  >
                    {c.noShowCount}
                  </span>
                )}
              </div>
              <div className="text-right text-[12.5px] font-semibold whitespace-nowrap text-[#5B8CFF]">보기 ›</div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="px-4 py-11 text-center text-[13px] text-[#A1A1AA]">검색 결과가 없습니다.</div>
        )}

        <div className="flex items-center justify-between border-t border-[#EFEFF2] bg-[#FAFAFA] px-4.5 py-3">
          <span className="text-xs text-[#A1A1AA]">
            {filtered.length}명 표시 · 전체 {enriched.length}명
          </span>
        </div>
      </div>

      <Dialog open={!!detail} onOpenChange={(open) => !open && setOpenId(null)}>
        <DialogContent className="max-w-140 gap-0 rounded-3.5 p-0">
          {detail && (
            <>
              <div className="flex items-start gap-3.5 border-b border-[#EFEFF2] px-6.5 py-6">
                <Avatar name={detail.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <DialogTitle className="mb-1 text-[18px] font-bold tracking-tight">{detail.name}</DialogTitle>
                  <p className="text-[13px] text-[#71717A]">
                    {detail.phone} · {detail.email ?? "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 px-6.5 py-5">
                <StatCard label="총 예약" value={`${detail.totalBookings}건`} />
                <StatCard label="완료" value={`${detailBookings.filter((b) => b.status === "completed").length}건`} />
                <StatCard
                  label="노쇼"
                  value={`${detail.noShowCount}건`}
                  danger={detail.noShowCount > 0}
                />
              </div>

              <div className="max-h-90 overflow-y-auto px-6.5 pb-6.5">
                <h3 className="mb-3 text-[13px] font-semibold">예약 이력</h3>
                <div className="flex flex-col">
                  {detailBookings.map((b, i) => {
                    const service = getService(b.serviceId);
                    return (
                      <div
                        key={b.id}
                        className={cn(
                          "flex items-center justify-between gap-4 py-3",
                          i !== detailBookings.length - 1 && "border-b border-[#F4F4F5]"
                        )}
                      >
                        <div className="flex min-w-0 flex-col gap-0.75">
                          <span className="text-[13px] font-semibold">{service.name}</span>
                          <span className="text-[11.5px] text-[#A1A1AA]">
                            {formatDateTimeFull(b.scheduledAt)} · {formatPrice(service.price)}
                          </span>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) {
  const large = size === "lg";
  return (
    <div
      className={cn(
        "flex flex-none items-center justify-center rounded-full bg-[#5B8CFF]/12 font-bold text-[#3F6FE0]",
        large ? "h-11 w-11 text-[15px]" : "h-7.5 w-7.5 text-xs"
      )}
    >
      {name.slice(0, 1)}
    </div>
  );
}

function StatCard({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-[10px] border border-[#E4E4E7] px-3.5 py-3">
      <div className="mb-1.5 text-[11.5px] text-[#71717A]">{label}</div>
      <div className={cn("text-[19px] font-bold tracking-tight", danger && "text-[#B42318]")}>{value}</div>
    </div>
  );
}
