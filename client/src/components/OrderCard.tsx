import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, User, Package, Calendar, MapPin, CreditCard, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import StatusBadge from "./StatusBadge";
import type { Order } from "@shared/schema";

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getValueRanking = (value: number) => {
    if (value > 5000) return { level: "Premium", color: "bg-chart-1" };
    if (value > 2000) return { level: "Alto", color: "bg-chart-3" };
    if (value > 500) return { level: "Médio", color: "bg-chart-2" };
    return { level: "Básico", color: "bg-muted" };
  };

  const getQuantityRanking = (qty: number) => {
    if (qty > 20) return "Alta";
    if (qty > 10) return "Média";
    return "Baixa";
  };

  const getCycleNumber = (cycle: string) => {
    return cycle.substring(0, 2);
  };

  const valueRanking = getValueRanking(Number(order.valorPedido));
  const quantityRanking = getQuantityRanking(order.qtdeItens);

  return (
    <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-lg hover-elevate transition-all duration-300" data-testid={`card-order-${order.codigoPedido}`}>
      <CardContent className="p-6">
        {/* Header with Order Code and Main Status */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-foreground" data-testid={`text-order-code-${order.codigoPedido}`}>
                #{order.codigoPedido}
              </h3>
              <StatusBadge type="fiscal" status={order.situacaoFiscal} />
              <StatusBadge type="commercial" status={order.situacaoComercial} />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span data-testid={`text-customer-${order.pessoa}`}>{order.nomePessoa} ({order.pessoa})</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground" data-testid={`text-value-${order.codigoPedido}`}>
              R$ {Number(order.valorPedido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <Badge className={`${valueRanking.color} text-white`} data-testid={`badge-value-ranking-${order.codigoPedido}`}>
              {valueRanking.level}
            </Badge>
          </div>
        </div>

        {/* Quick Info Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium" data-testid={`text-quantity-${order.codigoPedido}`}>{order.qtdeItens} itens</div>
              <div className="text-xs text-muted-foreground">Qtd. {quantityRanking}</div>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <StatusBadge type="payment" status={order.planoPagamento} />
          </div>
          
          <div className="flex flex-col gap-1">
            <StatusBadge type="delivery" status={order.tipoEntrega} />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-center">
              <div className="text-lg font-bold text-primary" data-testid={`text-cycle-${order.codigoPedido}`}>
                {getCycleNumber(order.cicloCaptacao)}
              </div>
              <div className="text-xs text-muted-foreground">Ciclo • Dia {order.diaCiclo}</div>
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-2" data-testid={`button-expand-${order.codigoPedido}`}>
              <span className="text-sm font-medium">Ver detalhes</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Customer Details */}
            <div className="bg-card/50 rounded-lg p-4 backdrop-blur-sm">
              <h4 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <User className="h-4 w-4" />
                Informações do Cliente
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Papel:</span>
                  <span className="ml-2 font-medium" data-testid={`text-role-${order.codigoPedido}`}>{order.papel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Telefone:</span>
                  <span className="ml-2 font-medium" data-testid={`text-phone-${order.codigoPedido}`}>{order.telefone || "Não informado"}</span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-card/50 rounded-lg p-4 backdrop-blur-sm">
              <h4 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <Calendar className="h-4 w-4" />
                Datas Importantes
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Aprovação:</span>
                  <span className="ml-2 font-medium" data-testid={`text-approval-date-${order.codigoPedido}`}>
                    {order.dataAprovacao ? format(new Date(order.dataAprovacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "Pendente"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Previsão Entrega:</span>
                  <span className="ml-2 font-medium" data-testid={`text-delivery-date-${order.codigoPedido}`}>
                    {order.previsaoEntrega ? format(new Date(order.previsaoEntrega), "dd/MM/yyyy", { locale: ptBR }) : "Não definida"}
                  </span>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-card/50 rounded-lg p-4 backdrop-blur-sm">
              <h4 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <MapPin className="h-4 w-4" />
                Endereço
              </h4>
              <div className="text-sm space-y-2">
                <div data-testid={`text-address-${order.codigoPedido}`}>
                  <span className="font-medium">
                    {order.logradouro && `${order.logradouro}, `}
                    {order.complemento && `${order.complemento}, `}
                    {order.bairro}
                  </span>
                </div>
                <div>
                  <span>{order.cidade} - {order.uf} • CEP: {order.cep}</span>
                </div>
                {order.referencia && (
                  <div className="text-muted-foreground">
                    <span className="text-xs">Referência:</span> {order.referencia}
                  </div>
                )}
                {(order.bairroEntregaRetirada || order.cidadeEntregaRetirada) && (
                  <div className="pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">Local de entrega/retirada:</span>
                    <div>{order.bairroEntregaRetirada}, {order.cidadeEntregaRetirada}</div>
                    {order.referenciaEntregaRetirada && (
                      <div className="text-xs text-muted-foreground">Ref: {order.referenciaEntregaRetirada}</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Staff */}
            <div className="bg-card/50 rounded-lg p-4 backdrop-blur-sm">
              <h4 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <Users className="h-4 w-4" />
                Equipe Responsável
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Estrutura:</span>
                  <span className="ml-2 font-medium" data-testid={`text-staff-structure-${order.codigoPedido}`}>
                    {order.responsavelEstrutura || "Não atribuído"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Finalização:</span>
                  <span className="ml-2 font-medium" data-testid={`text-staff-finalization-${order.codigoPedido}`}>
                    {order.usuarioFinalizacao || "Não atribuído"}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-card/50 rounded-lg p-4 backdrop-blur-sm">
              <h4 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <CreditCard className="h-4 w-4" />
                Detalhes do Pagamento
              </h4>
              <div className="text-sm">
                <span className="text-muted-foreground">Plano:</span>
                <span className="ml-2 font-medium" data-testid={`text-payment-plan-${order.codigoPedido}`}>{order.planoPagamento}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}