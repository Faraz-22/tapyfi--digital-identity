import { motion } from "framer-motion";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, MouseEvent } from "react";
import { Link } from "react-router-dom";
import { cn } from "../lib/format";

type BaseProps = {
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  to?: string;
};

type MagneticButtonProps =
  | (BaseProps & ButtonHTMLAttributes<HTMLButtonElement>)
  | (BaseProps & AnchorHTMLAttributes<HTMLAnchorElement>);

const variants = {
  primary: "bg-chrome text-ink hover:bg-white shadow-glow",
  secondary: "border border-white/15 bg-white/[0.08] text-white hover:bg-white/[0.14]",
  ghost: "text-chrome hover:bg-white/[0.08]"
};

export function MagneticButton({ variant = "primary", className, to, children, ...props }: MagneticButtonProps) {
  function handleMove(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${(event.clientX - rect.left - rect.width / 2) * 0.16}px`);
    event.currentTarget.style.setProperty("--my", `${(event.clientY - rect.top - rect.height / 2) * 0.16}px`);
  }

  function handleLeave(event: MouseEvent<HTMLElement>) {
    event.currentTarget.style.setProperty("--mx", "0px");
    event.currentTarget.style.setProperty("--my", "0px");
  }

  const classes = cn(
    "premium-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-300 [transform:translate3d(var(--mx,0),var(--my,0),0)]",
    variants[variant],
    className
  );

  if (to) {
    return (
      <motion.span whileTap={{ scale: 0.98 }}>
        <Link
          to={to}
          className={classes}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </Link>
      </motion.span>
    );
  }

  return (
    <motion.span whileTap={{ scale: 0.98 }} className={className?.includes("w-full") ? "block w-full" : "inline-block"}>
      <button
        className={classes}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    </motion.span>
  );
}
