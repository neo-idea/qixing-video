import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "quiet";
type Size = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex select-none items-center justify-center gap-2 rounded font-semibold transition duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:active:scale-100 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft";

const buttonVariants: Record<Variant, string> = {
  primary: "brand-button hover:brightness-110",
  secondary: "bg-[#2a2a2a] text-cinema-primary hover:bg-[#333]",
  ghost: "border border-[#333] bg-transparent text-cinema-muted hover:border-cinema-brand/60 hover:text-cinema-brand-soft",
  quiet: "text-cinema-muted hover:bg-[#2a2a2a] hover:text-cinema-primary",
};

const buttonSizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-sm",
};

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={`${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`} {...props} />;
}

export function LinkButton({ variant = "primary", size = "md", className = "", ...props }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={`${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`} {...props} />;
}

export function IconButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`grid h-9 w-9 place-items-center rounded bg-[#2a2a2a] text-cinema-muted transition duration-150 active:scale-[0.94] hover:bg-[#333] hover:text-cinema-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${className}`} {...props} />;
}

type ChipTone = "neutral" | "brand" | "success" | "warning";
type ChipSize = "sm" | "md" | "lg";

const chipTones: Record<ChipTone, string> = {
  neutral: "bg-[#2a2a2a] text-cinema-muted",
  brand: "bg-cinema-brand/15 text-cinema-brand-soft",
  success: "bg-cinema-success/15 text-cinema-success",
  warning: "bg-cinema-warning/15 text-cinema-warning",
};

const chipSizes: Record<ChipSize, string> = {
  sm: "px-1.5 py-0.5 text-[11px]",
  md: "px-2 py-1 text-xs",
  lg: "h-9 px-3 text-xs",
};

export function Chip({ tone = "neutral", size = "md", className = "", ...props }: ComponentProps<"span"> & { tone?: ChipTone; size?: ChipSize }) {
  return <span className={`inline-flex shrink-0 items-center rounded ${chipSizes[size]} ${chipTones[tone]} ${className}`} {...props} />;
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; wide?: boolean; className?: string }) {
  return <p className={`text-xs font-normal text-cinema-subtle ${className}`}>{children}</p>;
}

export function Panel({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`panel rounded-lg ${className}`} {...props} />;
}

export function EmptyState({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <Panel className="grid place-items-center px-4 py-16 text-center sm:py-20">
      <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-[#2a2a2a] text-cinema-subtle">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
      </span>
      <h2 className="text-base font-bold text-cinema-primary">{title}</h2>
      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-cinema-subtle">{description}</p>
      {children ? <div className="mt-5 flex flex-wrap justify-center gap-3">{children}</div> : null}
    </Panel>
  );
}
