import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle, XCircle, Home, Store } from "lucide-react";

interface StatusBadgeProps {
  type: "payment" | "fiscal" | "commercial" | "delivery";
  status: string;
  className?: string;
}

export default function StatusBadge({ type, status, className }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (type) {
      case "payment":
        // Business rule: BOLETO, Pix ou Cartão de Crédito ON-LINE = já foi pago
        const isPaid = status.includes("BOLETO") ||
                      status.includes("Pix") ||
                      status.includes("Cartão de Crédito ON-LINE");
        if (isPaid) {
          return {
            variant: "default" as const,
            icon: CheckCircle,
            label: "Pago",
            className: "bg-chart-1 text-white shrink-0"
          };
        }
        return {
          variant: "secondary" as const,
          icon: Clock,
          label: "Pendente",
          className: "bg-chart-2 text-white shrink-0"
        };

      case "fiscal":
        const isBilled = status.toLowerCase().includes("faturado");
        if (isBilled) {
          return {
            variant: "default" as const,
            icon: CheckCircle,
            label: "Faturado",
            className: "bg-chart-1 text-white shrink-0"
          };
        }
        return {
          variant: "secondary" as const,
          icon: AlertTriangle,
          label: "Não Faturado",
          className: "bg-chart-2 text-white shrink-0"
        };

      case "commercial":
        const isApproved = status.toLowerCase().includes("aprovado");
        if (isApproved) {
          return {
            variant: "default" as const,
            icon: CheckCircle,
            label: "Aprovado",
            className: "bg-chart-1 text-white shrink-0"
          };
        }
        return {
          variant: "destructive" as const,
          icon: XCircle,
          label: "Pendente",
          className: "bg-destructive text-white shrink-0"
        };

      case "delivery":
        // Business rule: "Retirar na central de serviço" = buscar na loja
        // "No endereço da entrega" = entrega em casa (pagou frete)
        const isStorePickup = status.includes("Retirar na central de serviço");
        if (isStorePickup) {
          return {
            variant: "outline" as const,
            icon: Store,
            label: "Buscar na Loja",
            className: "border-chart-3 text-chart-3 bg-chart-3/5 shrink-0"
          };
        }
        return {
          variant: "outline" as const,
          icon: Home,
          label: "Entrega em Casa",
          className: "border-primary text-primary bg-primary/5 shrink-0"
        };

      default:
        return {
          variant: "secondary" as const,
          icon: Clock,
          label: status.length > 15 ? status.substring(0, 15) + "..." : status,
          className: "shrink-0"
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className} flex items-center gap-1 px-2 py-1 min-w-fit max-w-full`}
      data-testid={`badge-${type}-${status.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <Icon className="h-3 w-3 flex-shrink-0" />
      <span className="text-xs font-medium whitespace-nowrap">{config.label}</span>
    </Badge>
  );
}