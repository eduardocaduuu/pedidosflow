import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, DollarSign, Home, Store, TrendingUp, XCircle } from "lucide-react";
import type { Order } from "@shared/schema";

interface OrderStatisticsProps {
  orders: Order[];
}

export default function OrderStatistics({ orders }: OrderStatisticsProps) {
  // Calculate statistics
  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, order) => sum + parseFloat(order.valorPedido), 0);

  // Calculate canceled orders and their values
  const canceledOrders = orders.filter(order =>
    order.situacaoComercial.toLowerCase().includes("cancelado")
  );
  const canceledValue = canceledOrders.reduce((sum, order) => sum + parseFloat(order.valorPedido), 0);

  // Calculate real value (total - canceled)
  const realValue = totalValue - canceledValue;

  const homeDeliveries = orders.filter(order => {
    const tipoEntrega = order.tipoEntrega.toLowerCase().trim();
    return tipoEntrega.includes("no endereço da entrega") ||
           tipoEntrega.includes("no endereco da entrega") ||
           tipoEntrega.includes("endereço da entrega") ||
           tipoEntrega.includes("endereco da entrega") ||
           tipoEntrega.includes("endereço de entrega") ||
           tipoEntrega.includes("endereco de entrega") ||
           (!tipoEntrega.includes("retirar") && !tipoEntrega.includes("central"));
  }).length;

  const storePickups = orders.filter(order => {
    const tipoEntrega = order.tipoEntrega.toLowerCase().trim();
    return tipoEntrega.includes("retirar na central de serviço") ||
           tipoEntrega.includes("retirar na central de servico") ||
           tipoEntrega.includes("retirar na central de serviços") ||
           tipoEntrega.includes("retirar na central de servicos") ||
           tipoEntrega.includes("central de serviço") ||
           tipoEntrega.includes("central de servico") ||
           tipoEntrega.includes("central de serviços") ||
           tipoEntrega.includes("central de servicos");
  }).length;

  // Enhanced payment calculation with refined business rules
  const paidOrders = orders.filter(order => {
    const commercialLower = order.situacaoComercial.toLowerCase().trim();
    const fiscalLower = order.situacaoFiscal.toLowerCase().trim();
    const paymentLower = order.planoPagamento.toLowerCase().trim();

    // Canceled orders are refunded (not paid), even if NF Emitida
    if (commercialLower.includes("cancelado")) return false;

    // NF Emitida + not canceled = paid (money in cash box)
    if (fiscalLower.includes("nf emitida") || fiscalLower.includes("nota fiscal emitida")) return true;

    // Entregue = always paid (all have NF Emitida in practice)
    if (commercialLower.includes("entregue")) return true;

    // Transporte = always paid (all have NF Emitida in practice)
    if (commercialLower.includes("transporte")) return true;

    // Aprovado = only paid if specific payment methods
    if (commercialLower.includes("aprovado")) {
      const validPaymentMethods = [
        "boleto",
        "parcele com pix",
        "cartão de crédito on-line",
        "cartao de credito on-line",
        "dinheiro",
        "pix"
      ];

      return validPaymentMethods.some(method => paymentLower.includes(method));
    }

    // Captação = future value, not paid yet
    if (commercialLower.includes("captacao") || commercialLower.includes("captação")) return false;

    return false;
  }).length;

  const averageOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;

  return (
    <Card className="backdrop-blur-xl bg-card/60 dark:bg-card/50 border border-border/40 shadow-2xl relative overflow-hidden">
      {/* Glass reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-chart-1/5 dark:from-white/5 dark:to-chart-1/10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/40" />

      <CardHeader className="pb-3 relative z-10">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" />
          Resumo dos Pedidos Importados
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {/* Main Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Orders */}
          <div className="bg-card/30 rounded-lg p-3 text-center">
            <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-foreground">{totalOrders}</div>
            <div className="text-xs text-muted-foreground">Pedidos Importados</div>
          </div>

          {/* Home Deliveries */}
          <div className="bg-card/30 rounded-lg p-3 text-center">
            <Home className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-foreground">{homeDeliveries}</div>
            <div className="text-xs text-muted-foreground">Entregas em Casa</div>
            <div className="text-xs text-muted-foreground">(Cliente pagou frete)</div>
          </div>

          {/* Store Pickups */}
          <div className="bg-card/30 rounded-lg p-3 text-center">
            <Store className="h-6 w-6 mx-auto mb-2 text-chart-3" />
            <div className="text-2xl font-bold text-foreground">{storePickups}</div>
            <div className="text-xs text-muted-foreground">Retiradas na Loja</div>
            <div className="text-xs text-muted-foreground">(Cliente busca)</div>
          </div>
        </div>

        {/* Financial Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Value */}
          <div className="bg-gradient-to-br from-chart-1/10 to-chart-1/5 rounded-lg p-3 text-center border border-chart-1/20">
            <DollarSign className="h-6 w-6 mx-auto mb-2 text-chart-1" />
            <div className="text-xl font-bold text-foreground">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground">Valor Total Bruto</div>
            <div className="text-xs text-muted-foreground">Todos os pedidos</div>
          </div>

          {/* Canceled Value */}
          <div className="bg-gradient-to-br from-red-100/50 to-red-50/30 rounded-lg p-3 text-center border border-red-200/50">
            <XCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
            <div className="text-xl font-bold text-red-700">
              R$ {canceledValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground">Valor Cancelado</div>
            <div className="text-xs text-red-600">{canceledOrders.length} pedidos cancelados</div>
          </div>

          {/* Real Value */}
          <div className="bg-gradient-to-br from-green-100/50 to-green-50/30 rounded-lg p-3 text-center border border-green-200/50">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-xl font-bold text-green-700">
              R$ {realValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground">Valor Real</div>
            <div className="text-xs text-green-600">Total - Cancelados</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50">
          {/* Average Order Value */}
          <div className="flex items-center justify-between p-3 bg-card/20 rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Ticket Médio</div>
              <div className="text-lg font-semibold">
                R$ {averageOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <Badge variant="outline" className="bg-chart-2/10">
              Por pedido
            </Badge>
          </div>

          {/* Payment Status */}
          <div className="flex items-center justify-between p-3 bg-card/20 rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Dinheiro em Caixa</div>
              <div className="text-lg font-semibold">
                {paidOrders} de {totalOrders}
              </div>
              <div className="text-xs text-green-600">Pedidos efetivamente pagos</div>
            </div>
            <Badge variant="outline" className="bg-green-100/50 border-green-200 text-green-700">
              {totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0}%
            </Badge>
          </div>
        </div>

        {/* Delivery Breakdown */}
        <div className="bg-card/20 rounded-lg p-3">
          <div className="text-sm font-medium mb-2">Distribuição de Entregas</div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Entregas em Casa</span>
            <span className="text-sm font-medium">{homeDeliveries} ({totalOrders > 0 ? Math.round((homeDeliveries / totalOrders) * 100) : 0}%)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Retiradas na Loja</span>
            <span className="text-sm font-medium">{storePickups} ({totalOrders > 0 ? Math.round((storePickups / totalOrders) * 100) : 0}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}