"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Option = { value: string; label: string };

export default function SortSelect({
  options,
  paramName = "sort",
  defaultValue,
}: {
  options: Option[];
  paramName?: string;
  defaultValue: string;
}) {
  const router      = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, value);
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="relative">
      <select
        defaultValue={defaultValue}
        onChange={(e) => handleChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className="material-symbols-outlined text-slate-400 text-sm absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        expand_more
      </span>
    </div>
  );
}
