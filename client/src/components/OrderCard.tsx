import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, User, Package, Calendar, MapPin, CreditCard, Users, Phone, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import StatusBadge from "./StatusBadge";
import type { Order } from "@shared/schema";

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Business Logic Functions
  const getValueRanking = (value: string) => {
    const numValue = parseFloat(value);
    if (numValue > 5000) return { level: "Premium", color: "bg-chart-1", priority: 4 };
    if (numValue > 2000) return { level: "Alto", color: "bg-chart-3", priority: 3 };
    if (numValue > 500) return { level: "Médio", color: "bg-chart-2", priority: 2 };
    return { level: "Básico", color: "bg-muted", priority: 1 };
  };

  const getQuantityRanking = (qty: number) => {
    if (qty > 20) return { level: "Alta", color: "text-chart-1", priority: 3 };
    if (qty > 10) return { level: "Média", color: "text-chart-3", priority: 2 };
    return { level: "Baixa", color: "text-muted-foreground", priority: 1 };
  };

  const getPersonValueRanking = (papel: string) => {
    const lowerPapel = papel.toLowerCase();
    if (lowerPapel.includes('premium') || lowerPapel.includes('vip')) {
      return { level: "Cliente Premium", color: "bg-chart-1", stars: 5 };
    }
    if (lowerPapel.includes('especial') || lowerPapel.includes('gold')) {
      return { level: "Cliente Especial", color: "bg-chart-3", stars: 4 };
    }
    if (lowerPapel.includes('regular') || lowerPapel.includes('padrão')) {
      return { level: "Cliente Regular", color: "bg-chart-2", stars: 3 };
    }
    return { level: "Cliente", color: "bg-muted", stars: 2 };
  };

  const getCycleDisplay = (cicloCaptacao: string) => {
    return cicloCaptacao.substring(0, 2);
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "Não informado";
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    }
    return phone;
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const valueRanking = getValueRanking(order.valorPedido);
  const quantityRanking = getQuantityRanking(order.qtdeItens);
  const personRanking = getPersonValueRanking(order.papel);

  return (
    <Card className="backdrop-blur-xl bg-card/60 dark:bg-card/50 border border-border/40 shadow-2xl hover-elevate transition-all duration-500 relative overflow-hidden group h-fit" data-testid={`card-order-${order.codigoPedido}`}>
      {/* Glass reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-primary/5 dark:from-white/5 dark:to-primary/10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/40" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-radial from-primary/10 to-transparent dark:from-primary/5 opacity-50 group-hover:opacity-70 transition-opacity duration-500" />

      <CardContent className="p-4 sm:p-6 relative z-10">
        {/* Header with Order Code and Status */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-foreground truncate" data-testid={`text-order-code-${order.codigoPedido}`}>
                #{order.codigoPedido}
              </h3>
              <div className="flex flex-wrap gap-1">
                <StatusBadge type="fiscal" status={order.situacaoFiscal} />
                <StatusBadge type="commercial" status={order.situacaoComercial} />
              </div>
            </div>

            {/* Customer Info with Value Ranking */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="truncate" data-testid={`text-customer-${order.pessoa}`}>
                  {order.nomePessoa} ({order.pessoa})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={`${personRanking.color} text-white text-xs`}>
                  {personRanking.level}
                </Badge>
                <div className="flex items-center gap-1">
                  {renderStars(personRanking.stars)}
                </div>
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground" data-testid={`text-value-${order.codigoPedido}`}>
              R$ {Number(order.valorPedido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <Badge className={`${valueRanking.color} text-white text-xs`} data-testid={`badge-value-ranking-${order.codigoPedido}`}>
              Valor {valueRanking.level}
            </Badge>
          </div>
        </div>

        {/* Quick Info Grid - Responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="flex items-center gap-2 p-2 bg-card/30 rounded-lg">
            <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium" data-testid={`text-quantity-${order.codigoPedido}`}>
                {order.qtdeItens} itens
              </div>
              <div className={`text-xs font-medium ${quantityRanking.color}`}>
                Qtde {quantityRanking.level}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center p-2 bg-card/30 rounded-lg">
            <StatusBadge type="payment" status={order.planoPagamento} />
          </div>

          <div className="flex items-center justify-center p-2 bg-card/30 rounded-lg">
            <StatusBadge type="delivery" status={order.tipoEntrega} />
          </div>

          <div className="flex items-center gap-2 p-2 bg-card/30 rounded-lg">
            <div className="text-center min-w-0 flex-1">
              <div className="text-lg font-bold text-primary" data-testid={`text-cycle-${order.codigoPedido}`}>
                {getCycleDisplay(order.cicloCaptacao)}
              </div>
              <div className="text-xs text-muted-foreground">Ciclo • Dia {order.diaCiclo}</div>
            </div>
          </div>
        </div>

        {/* Informações essenciais sempre visíveis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3 bg-card/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm truncate" data-testid={`text-phone-visible-${order.codigoPedido}`}>
              {formatPhoneNumber(order.telefone)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm truncate">
              {order.cidade} - {order.uf}
            </span>
          </div>
        </div>

        {/* Data de Aprovação e Previsão sempre visíveis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3 bg-card/20 rounded-lg">
          <div>
            <div className="text-xs text-muted-foreground">Data de Aprovação</div>
            <div className="text-sm font-medium" data-testid={`text-approval-visible-${order.codigoPedido}`}>
              {order.dataAprovacao ? format(new Date(order.dataAprovacao), "dd/MM/yyyy", { locale: ptBR }) : "Pendente"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Previsão de Entrega</div>
            <div className="text-sm font-medium" data-testid={`text-delivery-visible-${order.codigoPedido}`}>
              {order.previsaoEntrega ? format(new Date(order.previsaoEntrega), "dd/MM/yyyy", { locale: ptBR }) : "Não definida"}
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-2 hover:bg-primary/10" data-testid={`button-expand-${order.codigoPedido}`}>
              <span className="text-sm font-medium">
                {isExpanded ? 'Ocultar detalhes' : 'Ver detalhes completos'}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-3 pt-4">
            {/* Endereço Completo */}
            <div className="bg-card/50 rounded-lg p-3 backdrop-blur-sm">
              <h4 className="flex items-center gap-2 text-sm font-semibold mb-2">
                <MapPin className="h-4 w-4" />
                Endereço Completo
              </h4>
              <div className="text-sm space-y-1">
                {order.logradouro && (
                  <div className="font-medium" data-testid={`text-address-${order.codigoPedido}`}>
                    {order.logradouro}
                    {order.complemento && `, ${order.complemento}`}
                  </div>
                )}
                {order.bairro && <div>{order.bairro}</div>}
                <div className="text-muted-foreground">
                  {order.cidade} - {order.uf}
                  {order.cep && ` • CEP: ${order.cep}`}
                </div>
                {order.referencia && (
                  <div className="text-muted-foreground text-xs">
                    <span className="font-medium">Referência:</span> {order.referencia}
                  </div>
                )}

                {/* Local específico de entrega/retirada */}
                {(order.bairroEntregaRetirada || order.cidadeEntregaRetirada) && (
                  <div className="pt-2 mt-2 border-t border-border/50">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Local específico:
                    </div>
                    <div className="font-medium">
                      {order.bairroEntregaRetirada}, {order.cidadeEntregaRetirada}
                    </div>
                    {order.referenciaEntregaRetirada && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Ref:</span> {order.referenciaEntregaRetirada}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Funcionários Responsáveis */}
            <div className="bg-card/50 rounded-lg p-3 backdrop-blur-sm">
              <h4 className="flex items-center gap-2 text-sm font-semibold mb-2">
                <Users className="h-4 w-4" />
                Funcionários Responsáveis
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Responsável Estrutura:</span>
                  <span className="ml-2 font-medium block sm:inline" data-testid={`text-staff-structure-${order.codigoPedido}`}>
                    {order.responsavelEstrutura || "Não atribuído"}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    Ajudou o cliente a fazer e aprovar o pedido
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Usuário de Finalização:</span>
                  <span className="ml-2 font-medium block sm:inline" data-testid={`text-staff-finalization-${order.codigoPedido}`}>
                    {order.usuarioFinalizacao || "Não atribuído"}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    Ajudou o cliente a finalizar o pedido
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes do Pagamento */}
            <div className="bg-card/50 rounded-lg p-3 backdrop-blur-sm">
              <h4 className="flex items-center gap-2 text-sm font-semibold mb-2">
                <CreditCard className="h-4 w-4" />
                Detalhes do Pagamento
              </h4>
              <div className="text-sm">
                <span className="text-muted-foreground">Plano:</span>
                <span className="ml-2 font-medium block sm:inline" data-testid={`text-payment-plan-${order.codigoPedido}`}>
                  {order.planoPagamento}
                </span>
              </div>
            </div>

            {/* Datas Detalhadas */}
            <div className="bg-card/50 rounded-lg p-3 backdrop-blur-sm">
              <h4 className="flex items-center gap-2 text-sm font-semibold mb-2">
                <Calendar className="h-4 w-4" />
                Cronograma Detalhado
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Data e Hora da Aprovação:</span>
                  <span className="ml-2 font-medium block sm:inline" data-testid={`text-approval-detailed-${order.codigoPedido}`}>
                    {order.dataAprovacao ? format(new Date(order.dataAprovacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "Aguardando aprovação"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ciclo Completo:</span>
                  <span className="ml-2 font-medium block sm:inline">
                    {order.cicloCaptacao} (Dia {order.diaCiclo})
                  </span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}