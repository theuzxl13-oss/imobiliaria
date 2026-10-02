import { LEAD_STATUS_LABEL, LEAD_STATUS_STYLE, STATUS_LABEL, STATUS_STYLE } from "@/lib/constants";
import type { LeadStatus, PropertyStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

export function StatusBadge({ status }: { status: PropertyStatus }) {
  return <span className={cn("badge", STATUS_STYLE[status])}>{STATUS_LABEL[status]}</span>;
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <span className={cn("badge", LEAD_STATUS_STYLE[status])}>{LEAD_STATUS_LABEL[status]}</span>;
}
