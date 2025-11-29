"use client";

import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
        primary:
          "bg-brand-purple-100 text-brand-purple-700 dark:bg-brand-purple-900/30 dark:text-brand-purple-300",
        success:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        warning:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        teal: "bg-brand-teal-100 text-brand-teal-700 dark:bg-brand-teal-900/30 dark:text-brand-teal-400",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

// Preset badges for common use cases
export function VisibilityBadge({ visibility }: { visibility: string }) {
  const config: Record<
    string,
    { label: string; variant: BadgeProps["variant"] }
  > = {
    public: { label: "Public", variant: "success" },
    private: { label: "Private", variant: "default" },
    unlisted: { label: "Unlisted", variant: "warning" },
  };

  const { label, variant } = config[visibility] || {
    label: visibility,
    variant: "default",
  };
  return <Badge variant={variant}>{label}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { label: string; variant: BadgeProps["variant"] }
  > = {
    active: { label: "Active", variant: "success" },
    draft: { label: "Draft", variant: "warning" },
    inactive: { label: "Inactive", variant: "default" },
    suspended: { label: "Suspended", variant: "danger" },
  };

  const { label, variant } = config[status] || {
    label: status,
    variant: "default",
  };
  return <Badge variant={variant}>{label}</Badge>;
}

export function PricingBadge({
  isFree,
  price,
}: {
  isFree: boolean;
  price?: number;
}) {
  if (isFree) {
    return <Badge variant="teal">Free</Badge>;
  }
  if (price && price > 0) {
    return <Badge variant="primary">${price}/mo</Badge>;
  }
  return <Badge variant="primary">Paid</Badge>;
}
