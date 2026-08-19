"use client";

import { useState } from "react";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SERVICES, SHOP_NAME, type Service } from "@/lib/mock-data";
import { formatPrice, WEEKDAYS } from "@/lib/format";

const BASE_SLOTS = [
  "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30",
];

// The demo dataset is anchored to this fixed "today" so availability stays deterministic.
const TODAY = new Date(2026, 7, 17);

type Slot = { label: string; taken: boolean };

type Submitted = {
  bookingId: string;
  service: Service;
};

const STEP_LABELS = ["서비스", "날짜·시간", "정보 입력", "완료"];

function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadSlotsFor(isoDate: string, serviceId: string): Slot[] {
  const service = SERVICES.find((s) => s.id === serviceId)!;
  const step = service.durationMinutes >= 90 ? 3 : service.durationMinutes >= 60 ? 2 : 1;
  const seed = [...(isoDate + serviceId)].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return BASE_SLOTS.filter((_, i) => i % step === 0).map((label, i) => ({
    label,
    taken: (seed + i * 7) % 5 === 0,
  }));
}

export function BookingFlow() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [month, setMonth] = useState(new Date(2026, 7, 1));
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Submitted | null>(null);

  const service = serviceId ? SERVICES.find((s) => s.id === serviceId)! : null;
  const whenLabel =
    date && time
      ? `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]}) ${time}`
      : "";

  function fetchSlots(nextDate: Date, nextServiceId: string) {
    setSlotsLoading(true);
    setSlots([]);
    setTime(null);
    window.setTimeout(() => {
      setSlots(loadSlotsFor(toIsoDate(nextDate), nextServiceId));
      setSlotsLoading(false);
    }, 750);
  }

  function handleSelectService(id: string) {
    setServiceId(id);
    if (date) fetchSlots(date, id);
  }

  function handleSelectDate(nextDate: Date | undefined) {
    if (!nextDate) return;
    setDate(nextDate);
    if (serviceId) fetchSlots(nextDate, serviceId);
  }

  function handleSubmit() {
    if (!name.trim() || !phone.trim()) {
      setError("이름과 연락처는 필수 입력값입니다.");
      return;
    }
    setError(null);
    setSubmitted({
      bookingId: "bk_" + Math.random().toString(36).slice(2, 10),
      service: service!,
    });
    setStep(4);
  }

  function handleNext() {
    if (step === 3) {
      handleSubmit();
    } else {
      setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
    }
  }

  function handleBack() {
    setError(null);
    setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
  }

  function handleReset() {
    setStep(1);
    setServiceId(null);
    setDate(undefined);
    setTime(null);
    setSlots([]);
    setName("");
    setPhone("");
    setEmail("");
    setNote("");
    setError(null);
    setSubmitted(null);
  }

  const nextDisabled = (step === 1 && !serviceId) || (step === 2 && !(date && time));

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-[#EFEFF2] bg-white/86 backdrop-blur-sm">
        <div className="mx-auto flex max-w-170 items-center gap-2.5 px-6 py-4">
          <div className="h-5.5 w-5.5 rounded-md bg-[#5B8CFF]" />
          <span className="text-[15px] font-bold tracking-tight">BookFlow</span>
          <span className="ml-auto text-[13px] text-[#71717A]">{SHOP_NAME}</span>
        </div>
      </header>

      <main className="mx-auto max-w-170 px-6 pb-35 pt-11">
        <Stepper currentStep={step} />

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-1 duration-200">
            <h1 className="mb-1.5 text-2xl font-bold tracking-tight">서비스를 선택해주세요</h1>
            <p className="mb-6 text-sm text-[#71717A]">
              원하시는 서비스를 고르면 예약 가능한 시간을 보여드립니다.
            </p>
            <div className="flex flex-col gap-2.5">
              {SERVICES.map((sv) => {
                const selected = serviceId === sv.id;
                return (
                  <button
                    key={sv.id}
                    type="button"
                    onClick={() => handleSelectService(sv.id)}
                    className={cn(
                      "flex items-center justify-between gap-4 rounded-xl border bg-white px-4.5 py-4.25 text-left transition-all",
                      selected
                        ? "border-[#5B8CFF] shadow-[0_0_0_3px_rgba(91,140,255,0.14)]"
                        : "border-[#E4E4E7]"
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[15px] font-semibold tracking-tight">{sv.name}</span>
                      <span className="text-[13px] text-[#71717A]">
                        {sv.durationMinutes}분 · {formatPrice(sv.price)}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex h-5 w-5 flex-none items-center justify-center rounded-full border text-[11px]",
                        selected
                          ? "border-[#5B8CFF] bg-[#5B8CFF] text-white"
                          : "border-[#E4E4E7] text-transparent"
                      )}
                    >
                      ✓
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-1 duration-200">
            <h1 className="mb-1.5 text-2xl font-bold tracking-tight">날짜와 시간을 선택해주세요</h1>
            <p className="mb-6 text-sm text-[#71717A]">
              {service ? `${service.name} · ${service.durationMinutes}분` : ""}
            </p>

            <div className="rounded-xl border border-[#E4E4E7] p-2">
              <Calendar
                mode="single"
                locale={ko}
                month={month}
                onMonthChange={setMonth}
                selected={date}
                onSelect={handleSelectDate}
                disabled={(d) => d < TODAY || d.getDay() === 0}
                className="mx-auto"
              />
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-baseline gap-2">
                <h2 className="text-sm font-semibold">가능한 시간</h2>
                <span className="text-xs text-[#A1A1AA]">
                  {date ? `${date.getMonth() + 1}월 ${date.getDate()}일` : "날짜를 먼저 선택해주세요"}
                </span>
              </div>

              {slotsLoading && (
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-lg" />
                  ))}
                </div>
              )}

              {!slotsLoading && slots.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((s) => {
                    const selected = time === s.label;
                    return (
                      <button
                        key={s.label}
                        type="button"
                        disabled={s.taken}
                        onClick={() => setTime(s.label)}
                        className={cn(
                          "h-10 rounded-lg border text-[13px] font-semibold transition-colors",
                          s.taken
                            ? "cursor-default border-[#EFEFF2] bg-[#F4F4F5] text-[#C4C4CC] line-through"
                            : selected
                              ? "border-[#5B8CFF] bg-[#5B8CFF] text-white"
                              : "cursor-pointer border-[#E4E4E7] bg-white text-[#09090B]"
                        )}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {!slotsLoading && !!date && slots.length === 0 && (
                <div className="rounded-[10px] border border-dashed border-[#E4E4E7] p-6 text-center text-[13px] text-[#A1A1AA]">
                  선택한 날짜에는 가능한 시간이 없습니다.
                </div>
              )}

              <p className="mt-3.5 flex items-center gap-1.5 text-xs text-[#A1A1AA]">
                <span className="inline-block h-2.25 w-2.25 rounded-[3px] border border-[#E4E4E7] bg-[#F4F4F5]" />
                회색 처리된 시간은 마감되었습니다
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-1 duration-200">
            <h1 className="mb-1.5 text-2xl font-bold tracking-tight">예약자 정보를 입력해주세요</h1>
            <p className="mb-6 text-sm text-[#71717A]">확인 메시지를 받으실 연락처를 정확히 입력해주세요.</p>

            <div className="mb-6 flex flex-col gap-1.5 rounded-xl border border-[#EFEFF2] bg-[#FAFAFA] px-4 py-3.5">
              <div className="flex justify-between gap-4 text-[13px]">
                <span className="text-[#71717A]">서비스</span>
                <span className="font-semibold">{service?.name}</span>
              </div>
              <div className="flex justify-between gap-4 text-[13px]">
                <span className="text-[#71717A]">일시</span>
                <span className="font-semibold">{whenLabel}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4.5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="text-[13px] font-semibold">이름</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" className="h-10.5 rounded-lg px-3.5 text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone" className="text-[13px] font-semibold">연락처</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="010-0000-0000" className="h-10.5 rounded-lg px-3.5 text-sm" />
                <span className="text-xs text-[#A1A1AA]">이 번호로 예약 확인 메시지가 발송됩니다.</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-[13px] font-semibold">이메일 (선택)</Label>
                <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" placeholder="hong@example.com" className="h-10.5 rounded-lg px-3.5 text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="note" className="text-[13px] font-semibold">
                  요청사항 <span className="font-normal text-[#A1A1AA]">(선택)</span>
                </Label>
                <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="미리 알려주실 내용이 있다면 적어주세요." className="rounded-lg px-3.5 py-2.5 text-sm leading-relaxed" />
              </div>
            </div>

            {error && (
              <div className="mt-4.5 rounded-[10px] border border-[#FECDCA] bg-[#FFFBFA] px-3.5 py-3 text-[13px] text-[#B42318]">
                {error}
              </div>
            )}
          </div>
        )}

        {step === 4 && submitted && (
          <div className="animate-in fade-in slide-in-from-bottom-1 pt-4 text-center duration-200">
            <div className="mx-auto mb-4.5 flex h-14 w-14 items-center justify-center rounded-full bg-[#5B8CFF]/12 text-2xl text-[#5B8CFF]">
              ✓
            </div>
            <h1 className="mb-2 text-[23px] font-bold tracking-tight">예약이 접수되었습니다</h1>
            <p className="mb-7 text-sm text-[#71717A]">확인 메시지가 발송되었습니다. 사장님 확인 후 확정됩니다.</p>

            <div className="mx-auto max-w-105 rounded-xl border border-[#E4E4E7] px-4.5">
              <ReceiptRow k="예약 번호" v={submitted.bookingId} mono />
              <ReceiptRow k="서비스" v={submitted.service.name} />
              <ReceiptRow k="일시" v={whenLabel} />
              <ReceiptRow k="예약자" v={`${name} · ${phone}`} />
              <ReceiptRow
                k="상태"
                v={
                  <span className="rounded-full bg-[#5B8CFF]/12 px-2.5 py-0.5 text-xs font-semibold text-[#3F6FE0]">
                    확인 대기중
                  </span>
                }
                last
              />
            </div>

            <Button type="button" variant="outline" onClick={handleReset} className="mt-6.5 h-10.5 rounded-lg px-5 text-sm font-semibold">
              새 예약 하기
            </Button>
          </div>
        )}
      </main>

      {step <= 3 && (
        <div className="fixed inset-x-0 bottom-0 border-t border-[#EFEFF2] bg-white/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-170 items-center gap-2.5 px-6 py-3.5">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} className="h-11 rounded-lg px-4.5 text-sm font-semibold">
                이전
              </Button>
            )}
            <span className="flex-1 text-[13px] text-[#A1A1AA]">
              {step === 2 && date && time ? whenLabel : ""}
            </span>
            <Button
              type="button"
              disabled={nextDisabled}
              onClick={handleNext}
              className="h-11 rounded-lg px-5.5 text-sm font-semibold"
            >
              {step === 3 ? "예약 요청하기" : "다음"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-10 flex items-center">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const done = currentStep > n;
        const current = currentStep === n;
        return (
          <div key={label} className="flex min-w-0 flex-1 items-center">
            <div className="flex min-w-0 items-center gap-2">
              <div
                className={cn(
                  "flex h-5.5 w-5.5 flex-none items-center justify-center rounded-full text-[11px] font-bold",
                  current
                    ? "bg-[#5B8CFF] text-white"
                    : done
                      ? "bg-[#5B8CFF]/14 text-[#5B8CFF]"
                      : "bg-[#F4F4F5] text-[#A1A1AA]"
                )}
              >
                {done ? "✓" : n}
              </div>
              <span
                className={cn(
                  "overflow-hidden text-ellipsis whitespace-nowrap text-xs",
                  current ? "font-semibold text-[#09090B]" : done ? "font-medium text-[#5B8CFF]" : "font-medium text-[#A1A1AA]"
                )}
              >
                {label}
              </span>
            </div>
            {i !== STEP_LABELS.length - 1 && (
              <div
                className={cn("mx-2 h-px min-w-2 flex-1", done ? "bg-[#5B8CFF]/35" : "bg-[#EFEFF2]")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ReceiptRow({
  k,
  v,
  mono,
  last,
}: {
  k: string;
  v: React.ReactNode;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-3.5",
        !last && "border-b border-[#F4F4F5]"
      )}
    >
      <span className="text-[13px] text-[#71717A]">{k}</span>
      <span className={cn("text-[13px] font-semibold", mono && "font-mono text-xs font-normal text-[#71717A]")}>
        {v}
      </span>
    </div>
  );
}
