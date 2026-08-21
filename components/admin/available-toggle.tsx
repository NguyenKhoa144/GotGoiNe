"use client";

import { useTransition } from "react";
import { setProductAvailable } from "@/app/admin/products/actions";

export function AvailableToggle({ id, available }: { id: string; available: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-600">
      <input
        type="checkbox"
        defaultChecked={available}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.checked;
          startTransition(async () => {
            await setProductAvailable(id, next);
          });
        }}
      />
      Còn hàng
    </label>
  );
}
