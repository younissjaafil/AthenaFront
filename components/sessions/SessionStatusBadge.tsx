"use client";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { SessionStatus } from "@/lib/types/session";

interface SessionStatusBadgeProps {
  status: SessionStatus;
  size?: BadgeProps["size"];
}

export function SessionStatusBadge({
  status,
  size = "md",
}: SessionStatusBadgeProps) {
  const config: Record<
    SessionStatus,
    { label: string; variant: BadgeProps["variant"] }
  > = {
    pending: { label: "Pending", variant: "warning" },
    confirmed: { label: "Confirmed", variant: "success" },
    in_progress: { label: "In Progress", variant: "primary" },
    completed: { label: "Completed", variant: "info" },
    cancelled: { label: "Cancelled", variant: "danger" },
    no_show: { label: "No Show", variant: "default" },
  };

  const { label, variant } = config[status] || {
    label: status,
    variant: "default",
  };

  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
}
