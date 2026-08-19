import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/mock-data";

const STATUS_META: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: "대기", className: "bg-[#5B8CFF]/12 text-[#3F6FE0]" },
  confirmed: { label: "확정", className: "bg-[#108558]/11 text-[#107B52]" },
  completed: { label: "완료", className: "bg-[#F4F4F5] text-[#52525B]" },
  cancelled: { label: "취소", className: "bg-[#FAFAFA] text-[#A1A1AA]" },
  no_show: { label: "노쇼", className: "bg-[#D92D20]/9 text-[#B42318]" },
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold",
        meta.className
      )}
    >
      {meta.label}
    </span>
  );
}

export { STATUS_META };
