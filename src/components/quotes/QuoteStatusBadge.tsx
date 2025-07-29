interface QuoteStatusBadgeProps {
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

const statusLabels: Record<QuoteStatusBadgeProps["status"], string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Aprobada",
  REJECTED: "Rechazada",
};

const statusColors: Record<QuoteStatusBadgeProps["status"], string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
