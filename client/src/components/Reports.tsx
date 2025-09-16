import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  Store,
  Home,
  DollarSign,
  Target,
  Clock,
  Award,
  XCircle,
  Truck,
  Package,
  BarChart as BarChartIcon
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import type { Order } from "@shared/schema";

interface ReportsProps {
  orders: Order[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff7f', '#ff1493', '#00bfff'];

export default function Reports({ orders }: ReportsProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <BarChartIcon className="h-16 w-16 mx-auto text-muted-foreground" />
        <div>
          <h3 className="text-lg font-semibold">Nenhum dado para análise</h3>
          <p className="text-muted-foreground">
            Importe pedidos para visualizar relatórios e análises.
          </p>
        </div>
      </div>
    );
  }

  // Calculate analytics data
  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, order) => sum + parseFloat(order.valorPedido), 0);
  const averageOrderValue = totalValue / totalOrders;

  // Financial analytics with new business rules
  const canceledOrders = orders.filter(order =>
    order.situacaoComercial.toLowerCase().includes("cancelado")
  );
  const canceledValue = canceledOrders.reduce((sum, order) => sum + parseFloat(order.valorPedido), 0);
  const realValue = totalValue - canceledValue;
  const activeOrders = orders.filter(order => !order.situacaoComercial.toLowerCase().includes("cancelado"));

  // Commercial status analysis
  const commercialStatusStats = orders.reduce((acc, order) => {
    const status = order.situacaoComercial;
    if (!acc[status]) {
      acc[status] = { count: 0, value: 0 };
    }
    acc[status].count++;
    acc[status].value += parseFloat(order.valorPedido);
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  const commercialStatusData = Object.entries(commercialStatusStats)
    .map(([status, stats]) => ({ status, ...stats }))
    .sort((a, b) => b.value - a.value);

  // Fiscal status analysis
  const fiscalStatusStats = orders.reduce((acc, order) => {
    const status = order.situacaoFiscal;
    if (!acc[status]) {
      acc[status] = { count: 0, value: 0 };
    }
    acc[status].count++;
    acc[status].value += parseFloat(order.valorPedido);
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  const fiscalStatusData = Object.entries(fiscalStatusStats)
    .map(([status, stats]) => ({ status, ...stats }))
    .sort((a, b) => b.value - a.value);

  // Enhanced payment analysis with new rules
  const paidOrdersEnhanced = orders.filter(order => {
    const commercialLower = order.situacaoComercial.toLowerCase().trim();
    const fiscalLower = order.situacaoFiscal.toLowerCase().trim();

    // Canceled orders are not paid
    if (commercialLower.includes("cancelado")) return false;

    // NF Emitida = paid
    if (fiscalLower.includes("nf emitida")) return true;

    // Payment methods
    const hasPaymentMethod = order.planoPagamento.includes("BOLETO") ||
                           order.planoPagamento.includes("Pix") ||
                           order.planoPagamento.includes("Cartão de Crédito ON-LINE");

    // Home delivery with valid commercial status
    const isValidCommercialStatus = commercialLower.includes("aprovado") ||
                                  commercialLower.includes("entregue") ||
                                  commercialLower.includes("transporte");

    const isHomeDelivery = (() => {
      const tipoEntrega = order.tipoEntrega.toLowerCase().trim();
      return tipoEntrega.includes("no endereço da entrega") ||
             tipoEntrega.includes("no endereco da entrega") ||
             tipoEntrega.includes("endereço da entrega") ||
             tipoEntrega.includes("endereco da entrega") ||
             tipoEntrega.includes("endereço de entrega") ||
             tipoEntrega.includes("endereco de entrega") ||
             (!tipoEntrega.includes("retirar") && !tipoEntrega.includes("central"));
    })();

    return hasPaymentMethod || (isHomeDelivery && isValidCommercialStatus);
  });

  const paidValue = paidOrdersEnhanced.reduce((sum, order) => sum + parseFloat(order.valorPedido), 0);

  // Responsavel analysis
  const responsavelStats = orders.reduce((acc, order) => {
    const responsavel = order.responsavelEstrutura;
    if (!acc[responsavel]) {
      acc[responsavel] = { count: 0, value: 0 };
    }
    acc[responsavel].count++;
    acc[responsavel].value += parseFloat(order.valorPedido);
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  const topResponsaveis = Object.entries(responsavelStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Customer analysis - find repeat customers
  const customerStats = orders.reduce((acc, order) => {
    const customer = order.nomePessoa;
    if (!acc[customer]) {
      acc[customer] = { count: 0, value: 0 };
    }
    acc[customer].count++;
    acc[customer].value += parseFloat(order.valorPedido);
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  const repeatCustomers = Object.entries(customerStats)
    .filter(([, stats]) => stats.count > 1)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Expensive vs Cheap orders analysis
  const sortedOrders = orders.map(order => ({
    ...order,
    numericValue: parseFloat(order.valorPedido)
  })).sort((a, b) => b.numericValue - a.numericValue);

  const expensiveOrders = sortedOrders.slice(0, 5); // Top 5 most expensive
  const cheapOrders = sortedOrders.slice(-5).reverse(); // Top 5 cheapest

  // Store traffic analysis (pickup orders)
  const pickupOrders = orders.filter(order => {
    const tipoEntrega = order.tipoEntrega.toLowerCase();
    return tipoEntrega.includes("retirar na central") ||
           tipoEntrega.includes("central de serviço") ||
           tipoEntrega.includes("central de servicos");
  });

  const homeDeliveries = orders.filter(order => {
    const tipoEntrega = order.tipoEntrega.toLowerCase();
    return tipoEntrega.includes("endereço da entrega") ||
           tipoEntrega.includes("endereco da entrega") ||
           (!tipoEntrega.includes("retirar") && !tipoEntrega.includes("central"));
  });

  // Enhanced Responsavel performance analysis
  const responsavelPerformance = Object.entries(responsavelStats)
    .map(([name, stats]) => ({
      name,
      orders: stats.count,
      totalValue: stats.value,
      avgOrderValue: stats.value / stats.count,
      efficiency: (stats.value / totalValue) * 100, // % of total business
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 8);

  // Payment method analysis
  const paymentStats = orders.reduce((acc, order) => {
    const payment = order.planoPagamento;
    if (!acc[payment]) {
      acc[payment] = 0;
    }
    acc[payment]++;
    return acc;
  }, {} as Record<string, number>);

  const paymentData = Object.entries(paymentStats)
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count);

  // Value distribution
  const valueRanges = [
    { range: "0-100", min: 0, max: 100 },
    { range: "101-500", min: 101, max: 500 },
    { range: "501-1000", min: 501, max: 1000 },
    { range: "1001-2000", min: 1001, max: 2000 },
    { range: "2000+", min: 2001, max: Infinity }
  ];

  const valueDistribution = valueRanges.map(({ range, min, max }) => {
    const count = orders.filter(order => {
      const value = parseFloat(order.valorPedido);
      return value >= min && value <= max;
    }).length;
    return { range, count };
  });

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="backdrop-blur-xl bg-card/60 border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-card/60 border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <DollarSign className="h-8 w-8 text-chart-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-card/60 border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">R$ {averageOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-chart-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-card/60 border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fluxo de Loja</p>
                <p className="text-2xl font-bold">{pickupOrders.length}</p>
                <p className="text-xs text-muted-foreground">clientes na loja</p>
              </div>
              <Store className="h-8 w-8 text-chart-3" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-card/60 border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Real</p>
                <p className="text-2xl font-bold text-green-600">R$ {realValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-card/60 border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelados</p>
                <p className="text-2xl font-bold text-red-600">{canceledOrders.length}</p>
                <p className="text-xs text-red-500">R$ {canceledValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commercial Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="backdrop-blur-xl bg-card/60 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Status Comercial dos Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={commercialStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="status"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'value') return [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor Total'];
                    if (name === 'count') return [value, 'Quantidade'];
                    return [value, name];
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" name="count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-card/60 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Status Fiscal dos Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fiscalStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="status"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'value') return [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor Total'];
                    if (name === 'count') return [value, 'Quantidade'];
                    return [value, name];
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-3))" name="count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Payment Analysis */}
      <Card className="backdrop-blur-xl bg-card/60 border-border/40 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Análise de Pagamentos com Novas Regras de Negócio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-green-100/50 to-green-50/30 rounded-lg border border-green-200/50">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-700">Pedidos Pagos</span>
              </div>
              <div className="text-2xl font-bold text-green-700">{paidOrdersEnhanced.length}</div>
              <div className="text-sm text-green-600">
                R$ {paidValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalOrders > 0 ? Math.round((paidOrdersEnhanced.length / totalOrders) * 100) : 0}% do total
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-yellow-100/50 to-yellow-50/30 rounded-lg border border-yellow-200/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-700">Pendentes</span>
              </div>
              <div className="text-2xl font-bold text-yellow-700">{totalOrders - paidOrdersEnhanced.length - canceledOrders.length}</div>
              <div className="text-sm text-yellow-600">
                R$ {(totalValue - paidValue - canceledValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalOrders > 0 ? Math.round(((totalOrders - paidOrdersEnhanced.length - canceledOrders.length) / totalOrders) * 100) : 0}% do total
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-red-100/50 to-red-50/30 rounded-lg border border-red-200/50">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-700">Cancelados</span>
              </div>
              <div className="text-2xl font-bold text-red-700">{canceledOrders.length}</div>
              <div className="text-sm text-red-600">
                R$ {canceledValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalOrders > 0 ? Math.round((canceledOrders.length / totalOrders) * 100) : 0}% do total
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-100/50 to-blue-50/30 rounded-lg border border-blue-200/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-700">Taxa de Conversão</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {totalOrders > 0 ? Math.round((paidOrdersEnhanced.length / (totalOrders - canceledOrders.length)) * 100) : 0}%
              </div>
              <div className="text-sm text-blue-600">Pagos vs Ativos</div>
              <div className="text-xs text-muted-foreground mt-1">
                Excluindo cancelados
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-chart-1/10 via-chart-2/10 to-chart-3/10 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-chart-1" />
              <span className="font-medium">Regras de Pagamento Aplicadas</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-2">✅ Considerados Pagos:</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Status Fiscal: "NF Emitida"</li>
                  <li>• Pagamento: BOLETO, Pix, Cartão Online</li>
                  <li>• Entrega em casa (se Aprovado/Entregue/Transporte)</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">❌ Não Considerados Pagos:</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Status Comercial: "Cancelado"</li>
                  <li>• Retirada na loja (sem confirmação de pagamento)</li>
                  <li>• Entrega em casa se status inadequado</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Impact Analysis */}
      <Card className="backdrop-blur-xl bg-card/60 border-border/40 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Impacto Financeiro dos Cancelamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-chart-1/10 to-chart-1/5 rounded-lg border border-chart-1/20">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Análise Comparativa de Valores
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Valor Bruto Total:</span>
                    <span className="font-bold text-lg">
                      R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-red-600">
                    <span className="text-sm">(-) Valor Cancelado:</span>
                    <span className="font-bold">
                      -R$ {canceledValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center text-green-600">
                      <span className="text-sm font-medium">(=) Valor Real:</span>
                      <span className="font-bold text-xl">
                        R$ {realValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-red-100/50 to-red-50/30 rounded-lg border border-red-200/50">
                <h4 className="font-medium mb-3 flex items-center gap-2 text-red-700">
                  <XCircle className="h-4 w-4" />
                  Impacto dos Cancelamentos
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa de Cancelamento:</span>
                    <span className="font-medium text-red-600">
                      {totalOrders > 0 ? ((canceledOrders.length / totalOrders) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Perda Financeira:</span>
                    <span className="font-medium text-red-600">
                      {totalValue > 0 ? ((canceledValue / totalValue) * 100).toFixed(1) : 0}% do faturamento
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ticket Médio Cancelado:</span>
                    <span className="font-medium text-red-600">
                      R$ {canceledOrders.length > 0 ? (canceledValue / canceledOrders.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={[
                  { name: 'Valor Bruto', value: totalValue, fill: '#8884d8' },
                  { name: 'Valor Cancelado', value: canceledValue, fill: '#ff4444' },
                  { name: 'Valor Real', value: realValue, fill: '#44ff44' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Responsaveis */}
        <Card className="backdrop-blur-xl bg-card/60 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Responsáveis por Estrutura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topResponsaveis}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Responsavel Performance */}
        <Card className="backdrop-blur-xl bg-card/60 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance dos Responsáveis por Valor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responsavelPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'totalValue') return [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor Total'];
                    if (name === 'avgOrderValue') return [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Ticket Médio'];
                    return [value, name];
                  }}
                />
                <Bar dataKey="totalValue" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="backdrop-blur-xl bg-card/60 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Métodos de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ method, count }) => `${method}: ${count}`}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Value Distribution */}
        <Card className="backdrop-blur-xl bg-card/60 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Distribuição de Valores (R$)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={valueDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Customer Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repeat Customers */}
        <Card className="backdrop-blur-xl bg-card/60 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Clientes com Múltiplos Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {repeatCustomers.length > 0 ? (
                repeatCustomers.map((customer, index) => (
                  <div key={customer.name} className="flex items-center justify-between p-3 bg-card/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-primary/10">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium truncate max-w-[200px]">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {customer.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-chart-1/10">
                      {customer.count} pedidos
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum cliente com múltiplos pedidos encontrado.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delivery vs Pickup */}
        <Card className="backdrop-blur-xl bg-card/60 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Entrega vs Retirada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Visual comparison with bars */}
              <div className="relative">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold">Distribuição Visual de Entregas</h4>
                  <p className="text-sm text-muted-foreground">Compare os tipos de entrega lado a lado</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <Home className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold text-primary">{homeDeliveries.length}</div>
                    <div className="text-sm font-medium">Entregas em Casa</div>
                    <div className="text-xs text-muted-foreground">Cliente pagou frete</div>
                    <Badge className="mt-2 bg-primary/10 text-primary">
                      {totalOrders > 0 ? Math.round((homeDeliveries.length / totalOrders) * 100) : 0}%
                    </Badge>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-chart-3/10 to-chart-3/5 rounded-lg border border-chart-3/20">
                    <Store className="h-8 w-8 mx-auto mb-2 text-chart-3" />
                    <div className="text-2xl font-bold text-chart-3">{pickupOrders.length}</div>
                    <div className="text-sm font-medium">Retiradas na Loja</div>
                    <div className="text-xs text-muted-foreground">Cliente busca</div>
                    <Badge className="mt-2 bg-chart-3/10 text-chart-3">
                      {totalOrders > 0 ? Math.round((pickupOrders.length / totalOrders) * 100) : 0}%
                    </Badge>
                  </div>
                </div>

                {/* Visual progress bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Entregas em Casa</span>
                      <span>{homeDeliveries.length} pedidos</span>
                    </div>
                    <div className="w-full bg-card/50 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${totalOrders > 0 ? (homeDeliveries.length / totalOrders) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Retiradas na Loja</span>
                      <span>{pickupOrders.length} pedidos</span>
                    </div>
                    <div className="w-full bg-card/50 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-chart-3 to-chart-3/80 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${totalOrders > 0 ? (pickupOrders.length / totalOrders) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced insights with multiple cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="h-5 w-5 text-primary" />
                    <span className="font-medium">Insight de Entregas</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {homeDeliveries.length > 0 ? (
                      <>
                        <strong>{homeDeliveries.length} clientes</strong> optaram por receber em casa,
                        gerando receita adicional de frete e demonstrando preferência por conveniência.
                      </>
                    ) : (
                      'Nenhuma entrega em casa identificada.'
                    )}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-chart-3/10 to-chart-3/5 rounded-lg border border-chart-3/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-chart-3" />
                    <span className="font-medium">Fluxo de Loja</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pickupOrders.length > 0 ? (
                      <>
                        Espera-se <strong>{pickupOrders.length} visitantes</strong> na loja,
                        oportunidade para vendas adicionais e fortalecimento do relacionamento.
                      </>
                    ) : (
                      'Nenhuma retirada agendada para análise de fluxo.'
                    )}
                  </p>
                </div>
              </div>

              {/* Summary comparison */}
              <div className="p-4 bg-gradient-to-r from-chart-1/10 via-chart-2/10 to-chart-3/10 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-chart-1" />
                  <span className="font-medium">Resumo Estratégico</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{totalOrders}</div>
                    <div className="text-muted-foreground">Total de Pedidos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-chart-3">
                      {totalOrders > 0 ? Math.round((pickupOrders.length / totalOrders) * 100) : 0}%
                    </div>
                    <div className="text-muted-foreground">Precisam de Atendimento</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-chart-1">
                      {totalOrders > 0 ? Math.round((homeDeliveries.length / totalOrders) * 100) : 0}%
                    </div>
                    <div className="text-muted-foreground">Receita de Frete</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expensive vs Cheap Orders Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Expensive Orders */}
        <Card className="backdrop-blur-xl bg-card/60 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-1" />
              Pedidos Mais Caros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expensiveOrders.map((order, index) => (
                <div key={order.codigoPedido} className="flex items-center justify-between p-3 bg-gradient-to-r from-chart-1/10 to-chart-1/5 rounded-lg border border-chart-1/20">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-chart-1/10 border-chart-1/30">
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium truncate max-w-[200px]">{order.nomePessoa}</p>
                      <p className="text-xs text-muted-foreground">
                        Pedido: {order.codigoPedido}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-chart-1 text-white">
                      R$ {order.numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cheapest Orders */}
        <Card className="backdrop-blur-xl bg-card/60 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-chart-2" />
              Pedidos Mais Baratos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cheapOrders.map((order, index) => (
                <div key={order.codigoPedido} className="flex items-center justify-between p-3 bg-gradient-to-r from-chart-2/10 to-chart-2/5 rounded-lg border border-chart-2/20">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-chart-2/10 border-chart-2/30">
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium truncate max-w-[200px]">{order.nomePessoa}</p>
                      <p className="text-xs text-muted-foreground">
                        Pedido: {order.codigoPedido}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-chart-2 text-white">
                      R$ {order.numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Responsavel Details */}
      <Card className="backdrop-blur-xl bg-card/60 border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Análise Detalhada dos Responsáveis por Estrutura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {responsavelPerformance.map((resp, index) => (
              <div key={resp.name} className="p-4 bg-card/30 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="bg-primary/10">
                    #{index + 1}
                  </Badge>
                  <h4 className="font-medium truncate">{resp.name}</h4>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pedidos:</span>
                    <span className="font-medium">{resp.orders}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor Total:</span>
                    <span className="font-medium text-chart-1">
                      R$ {resp.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ticket Médio:</span>
                    <span className="font-medium">
                      R$ {resp.avgOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">% do Negócio:</span>
                    <span className="font-medium text-chart-3">
                      {resp.efficiency.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="mt-3 bg-gradient-to-r from-chart-3/10 to-transparent h-2 rounded-full">
                  <div
                    className="h-full bg-chart-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(resp.efficiency, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}