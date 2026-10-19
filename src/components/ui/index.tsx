import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "quiet";
type Size = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex select-none items-center justify-center gap-2 rounded-md font-semibold transition duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:active:scale-100 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft";

const buttonVariants: Record<Variant, string> = {
  primary: "brand-button hover:brightness-110",
  secondary: "border border-white/8 bg-cinema-elevated text-cinema-primary hover:border-white/16 hover:bg-white/8",
  ghost: "border border-white/10 bg-black/20 text-cinema-muted hover:border-cinema-brand/50 hover:bg-cinema-brand/8 hover:text-cinema-brand-soft",
  quiet: "text-cinema-muted hover:bg-white/8 hover:text-cinema-primary",
};

const buttonSizes: Record<Size, string> = {
  sm: "h-10 px-3.5 text-xs",
  md: "h-11 px-4 text-sm",
  lg: "h-11 px-6 text-sm sm:h-12",
};

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={`${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`} {...props} />;
}

export function LinkButton({ variant = "primary", size = "md", className = "", ...props }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={`${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`} {...props} />;
}

export function IconButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`grid h-10 w-10 place-items-center rounded-md border border-white/8 bg-cinema-elevated text-cinema-muted transition duration-150 active:scale-[0.94] hover:border-white/16 hover:text-cinema-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${className}`} {...props} />;
}

type ChipTone = "neutral" | "brand" | "success" | "warning";
type ChipSize = "sm" | "md" | "lg";

const chipTones: Record<ChipTone, string> = {
  neutral: "border border-white/8 bg-white/6 text-cinema-muted",
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
  return <span className={`inline-flex shrink-0 items-center rounded-md ${chipSizes[size]} ${chipTones[tone]} ${className}`} {...props} />;
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; wide?: boolean; className?: string }) {
  return <p className={`text-xs tracking-wide text-cinema-subtle ${className}`}>{children}</p>;
}

export function Panel({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`panel rounded-lg ${className}`} {...props} />;
}

export function EmptyState({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <Panel className="grid place-items-center px-4 py-16 text-center sm:py-20">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-full border border-white/8 bg-white/6 text-cinema-subtle">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
      </span>
      <h2 className="text-base font-bold text-cinema-primary sm:text-lg">{title}</h2>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-cinema-subtle">{description}</p>
      {children ? <div className="mt-5 flex flex-wrap justify-center gap-3">{children}</div> : null}
    </Panel>
  );
}
