import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  ribbon?: string; // Tailwind bg-* color class, e.g. "bg-emerald-500"
}

export default function Card({ children, className = "", ribbon }: CardProps) {
  return (
    <div className={`tonal-card rounded-xl relative overflow-hidden ${className}`}>
      {ribbon && <div className={`status-ribbon ${ribbon}`} aria-hidden="true" />}
      <div className="p-lg">{children}</div>
    </div>
  );
}
