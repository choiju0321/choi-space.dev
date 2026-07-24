import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const variantStyles = {
  primary:
    "bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-80",
  secondary:
    "bg-transparent text-[var(--color-foreground)] underline-offset-[6px] hover:underline",
  ghost:
    "bg-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
} as const;

const sizeStyles = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
} as const;

type ButtonVariant = keyof typeof variantStyles;
type ButtonSize = keyof typeof sizeStyles;

type CommonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonAsButton = CommonProps &
  Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "className"
  > & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
  external?: boolean;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function buttonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-sm font-medium tracking-tight transition-[opacity,color,text-decoration] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-foreground)]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:pointer-events-none disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    className,
  );
}

export function Button(props: ButtonProps) {
  if (typeof props.href === "string") {
    const {
      children,
      className,
      variant = "primary",
      size = "md",
      href,
      external,
    } = props;
    const classes = buttonClassName(variant, size, className);

    if (external || href.startsWith("http") || href.startsWith("mailto:")) {
      return (
        <a
          href={href}
          className={classes}
          {...(external || href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const {
    children,
    className,
    variant = "primary",
    size = "md",
    ...rest
  } = props;
  const classes = buttonClassName(variant, size, className);

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
