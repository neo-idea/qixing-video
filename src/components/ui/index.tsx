import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "quiet";
type Size = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft";

const buttonVariants: Record<Variant, string> = {
  primary: "brand-button text-white hover:scale-[1.02]",
  secondary: "border border-white/12 bg-white/8 text-white backdrop-blur hover:bg-white/16",
  ghost: "border border-white/10 bg-white/5 text-cinema-muted hover:border-cinema-brand/50 hover:text-white",
  quiet: "text-cinema-muted hover:bg-white/8 hover:text-white",
};

const buttonSizes: Record<Size, string> = {
  sm: "h-11 px-4 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-sm",
};

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={`${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`} {...props} />;
}

export function LinkButton({ variant = "primary", size = "md", className = "", ...props }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={`${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`} {...props} />;
}

export function IconButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/6 text-cinema-muted transition hover:border-cinema-brand/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-brand-soft ${className}`} {...props} />;
}

type ChipTone = "neutral" | "brand" | "success" | "warning";
type ChipSize = "sm" | "md" | "lg";

const chipTones: Record<ChipTone, string> = {
  neutral: "border-white/8 bg-white/5 text-cinema-muted",
  brand: "border-cinema-brand/25 bg-cinema-brand/10 text-cinema-brand-soft",
  success: "border-cinema-success/20 bg-cinema-success/10 text-cinema-success",
  warning: "border-cinema-warning/20 bg-cinema-warning/10 text-cinema-warning",
};

const chipSizes: Record<ChipSize, string> = {
  sm: "px-2 py-1 text-[10px]",
  md: "px-3 py-2 text-xs",
  lg: "min-h-12 px-4 py-3 text-xs",
};

export function Chip({ tone = "neutral", size = "md", className = "", ...props }: ComponentProps<"span"> & { tone?: ChipTone; size?: ChipSize }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full border ${chipSizes[size]} ${chipTones[tone]} ${className}`} {...props} />;
}

export function Eyebrow({ children, wide = false, className = "" }: { children: ReactNode; wide?: boolean; className?: string }) {
  return <p className={`text-[10px] font-bold uppercase ${wide ? "tracking-[0.36em]" : "tracking-[0.3em]"} text-cinema-brand-soft ${className}`}>{children}</p>;
}

export function Panel({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`panel rounded-2xl ${className}`} {...props} />;
}

export function EmptyState({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <Panel className="grid place-items-center px-4 py-16 text-center sm:py-20">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-cinema-subtle">{description}</p>
      {children ? <div className="mt-5 flex flex-wrap justify-center gap-3">{children}</div> : null}
    </Panel>
  );
}
