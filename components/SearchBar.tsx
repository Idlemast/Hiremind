"use client";

import { useRouter, usePathname } from "next/navigation";

export default function SearchBar({
  placeholder,
  defaultValue = "",
  keepParams = {},
}: {
  placeholder: string;
  defaultValue?: string;
  keepParams?: Record<string, string>;
}) {
  const router   = useRouter();
  const pathname = usePathname();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q      = e.target.value.trim();
    const params = new URLSearchParams(keepParams);
    if (q) params.set("q", q);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm leading-none pointer-events-none">
        search
      </span>
      <input
        type="text"
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white w-64"
      />
    </div>
  );
}
