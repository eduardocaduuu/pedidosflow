import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle, XCircle, Home, Store, Truck, Package, CircleCheck } from "lucide-react";

interface StatusBadgeProps {
  type: "payment" | "fiscal" | "commercial" | "delivery";
  status: string;
  className?: string;
  deliveryType?: string; // For enhanced payment logic
  fiscalStatus?: string; // For payment logic based on NF Emitida
  commercialStatus?: string; // For payment logic based on commercial status
}

export default function StatusBadge({ type, status, className, deliveryType, fiscalStatus, commercialStatus }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (type) {
      case "payment":
        // Refined Business Rules for Payment Status:
        // 1. Cancelado: Estornado (money refunded, even if NF Emitida)
        // 2. NF Emitida + !Cancelado: Pago (money in cash box)
        // 3. Entregue: Always paid (all have NF Emitida)
        // 4. Transporte: Always paid (all have NF Emitida)
        // 5. Aprovado: Only paid if payment method is BOLETO, Parcele com Pix, Cartão de Crédito ON-LINE, Dinheiro, PIX
        // 6. Captação: Future value, not paid yet

        const commercialLower = commercialStatus?.toLowerCase().trim() || "";
        const fiscalLower = fiscalStatus?.toLowerCase().trim() || "";
        const paymentLower = status.toLowerCase().trim();

        // Rule 1: Canceled orders = Refunded (even if NF Emitida)
        if (commercialLower.includes("cancelado")) {
          return {
            variant: "destructive" as const,
            icon: XCircle,
            label: "Estornado",
            className: "bg-red-600 text-white shrink-0"
          };
        }

        // Rule 2: NF Emitida + not canceled = Paid (money in cash box)
        const isNFEmitida = fiscalLower.includes("nf emitida") || fiscalLower.includes("nota fiscal emitida");
        if (isNFEmitida) {
          return {
            variant: "default" as const,
            icon: CheckCircle,
            label: "Pago",
            className: "bg-green-600 text-white shrink-0"
          };
        }

        // Rule 3: Entregue = Always paid (all have NF Emitida in practice)
        if (commercialLower.includes("entregue")) {
          return {
            variant: "default" as const,
            icon: CheckCircle,
            label: "Pago",
            className: "bg-green-600 text-white shrink-0"
          };
        }

        // Rule 4: Transporte = Always paid (all have NF Emitida in practice)
        if (commercialLower.includes("transporte")) {
          return {
            variant: "default" as const,
            icon: CheckCircle,
            label: "Pago",
            className: "bg-green-600 text-white shrink-0"
          };
        }

        // Rule 5: Aprovado = Only paid if specific payment methods
        if (commercialLower.includes("aprovado")) {
          const validPaymentMethods = [
            "boleto",
            "parcele com pix",
            "cartão de crédito on-line",
            "cartao de credito on-line",
            "dinheiro",
            "pix"
          ];

          const isPaidMethod = validPaymentMethods.some(method =>
            paymentLower.includes(method)
          );

          if (isPaidMethod) {
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
            className: "bg-yellow-600 text-white shrink-0"
          };
        }

        // Rule 6: Captação = Future value, not paid yet
        if (commercialLower.includes("captacao") || commercialLower.includes("captação")) {
          return {
            variant: "secondary" as const,
            icon: Clock,
            label: "Valor Futuro",
            className: "bg-orange-600 text-white shrink-0"
          };
        }

        // Default: Pendente
        return {
          variant: "secondary" as const,
          icon: Clock,
          label: "Pendente",
          className: "bg-yellow-600 text-white shrink-0"
        };

      case "fiscal":
        const statusLower = status.toLowerCase().trim();

        // Check for "Não faturado" status
        const isNotBilled = statusLower.includes("nao faturado") ||
                           statusLower.includes("não faturado") ||
                           statusLower === "nao faturado" ||
                           statusLower === "não faturado";

        if (isNotBilled) {
          return {
            variant: "secondary" as const,
            icon: AlertTriangle,
            label: "Não Faturado",
            className: "bg-destructive text-white shrink-0"
          };
        }

        // Check for "NF Emitida" - means invoice issued and money in cash
        const isInvoiceIssued = statusLower.includes("nf emitida") ||
                              statusLower.includes("nota fiscal emitida") ||
                              statusLower === "nf emitida";

        if (isInvoiceIssued) {
          return {
            variant: "default" as const,
            icon: CheckCircle,
            label: "NF Emitida",
            className: "bg-green-600 text-white shrink-0"
          };
        }

        // Check for regular "FATURADO" (without NAO/NÃO)
        if (statusLower === "faturado") {
          return {
            variant: "default" as const,
            icon: CheckCircle,
            label: "Faturado",
            className: "bg-chart-1 text-white shrink-0"
          };
        }

        // Default to not billed for any other case
        return {
          variant: "secondary" as const,
          icon: AlertTriangle,
          label: "Não Faturado",
          className: "bg-destructive text-white shrink-0"
        };

      case "commercial":
        const statusCommercial = status.toLowerCase().trim();

        // Transporte - order waiting for pickup by customer
        if (statusCommercial.includes("transporte")) {
          return {
            variant: "secondary" as const,
            icon: Truck,
            label: "Transporte",
            className: "bg-blue-600 text-white shrink-0"
          };
        }

        // Cancelado - order was cancelled
        if (statusCommercial.includes("cancelado")) {
          return {
            variant: "destructive" as const,
            icon: XCircle,
            label: "Cancelado",
            className: "bg-red-600 text-white shrink-0"
          };
        }

        // Entregue - customer already received order
        if (statusCommercial.includes("entregue")) {
          return {
            variant: "default" as const,
            icon: CircleCheck,
            label: "Entregue",
            className: "bg-green-600 text-white shrink-0"
          };
        }

        // Aprovado - order approved, waiting for separation and billing
        if (statusCommercial.includes("aprovado")) {
          return {
            variant: "default" as const,
            icon: CheckCircle,
            label: "Aprovado",
            className: "bg-chart-1 text-white shrink-0"
          };
        }

        // Captacao - order in capture phase
        if (statusCommercial.includes("captacao") || statusCommercial.includes("captação")) {
          return {
            variant: "secondary" as const,
            icon: Package,
            label: "Captação",
            className: "bg-orange-600 text-white shrink-0"
          };
        }

        // Default case for any other status
        return {
          variant: "secondary" as const,
          icon: Clock,
          label: status,
          className: "bg-gray-600 text-white shrink-0"
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