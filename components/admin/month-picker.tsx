"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type MonthPickerProps = {
  // Nhãn tính sẵn ở server — không truyền hàm từ Server Component sang đây
  // được, vì props phải chuyển thành dữ liệu thuần để gửi xuống trình duyệt.
  months: { key: string; label: string }[];
  selected: string;
};

export function MonthPicker({ months, selected }: MonthPickerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={selected}
      disabled={pending}
      aria-label="Chọn tháng xem thống kê"
      onChange={(e) => {
        const month = e.target.value;
        startTransition(() => {
          router.push(`/admin/stats?thang=${month}`);
        });
      }}
      className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-semibold text-[#152b1a] outline-none focus:border-[#1e5c2e] disabled:opacity-60"
    >
      {months.map((month) => (
        <option key={month.key} value={month.key}>
          {month.label}
        </option>
      ))}
    </select>
  );
}
