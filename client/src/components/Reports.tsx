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
  Award
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
        <BarChart className="h-16 w-16 mx-auto text-muted-foreground" />
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

  // Daily store traffic simulation (pickup orders by date)
  const trafficByDate = pickupOrders.reduce((acc, order) => {
    const date = order.dataFinalizacao ? new Date(order.dataFinalizacao).toLocaleDateString('pt-BR') : 'Data não informada';
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date]++;
    return acc;
  }, {} as Record<string, number>);

  const trafficData = Object.entries(trafficByDate)
    .map(([date, count]) => ({ date, visitors: count }))
    .sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime())
    .slice(-14); // Last 14 days

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      </div>

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

        {/* Store Traffic */}
        <Card className="backdrop-blur-xl bg-card/60 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Fluxo de Clientes na Loja (Últimos 14 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="hsl(var(--chart-3))"
                  fill="hsl(var(--chart-3))"
                  fillOpacity={0.3}
                />
              </AreaChart>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-card/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Home className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">Entregas em Casa</p>
                    <p className="text-sm text-muted-foreground">Cliente pagou frete</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{homeDeliveries.length}</p>
                  <p className="text-sm text-muted-foreground">
                    {totalOrders > 0 ? Math.round((homeDeliveries.length / totalOrders) * 100) : 0}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-card/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Store className="h-6 w-6 text-chart-3" />
                  <div>
                    <p className="font-medium">Retiradas na Loja</p>
                    <p className="text-sm text-muted-foreground">Cliente busca</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{pickupOrders.length}</p>
                  <p className="text-sm text-muted-foreground">
                    {totalOrders > 0 ? Math.round((pickupOrders.length / totalOrders) * 100) : 0}%
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gradient-to-r from-chart-3/10 to-chart-1/10 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-chart-3" />
                  <span className="text-sm font-medium">Insight de Fluxo</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {pickupOrders.length > 0 ? (
                    <>
                      Espera-se aproximadamente <strong>{pickupOrders.length} clientes</strong> visitando a loja
                      para retirar seus pedidos, representando o fluxo de pessoas no estabelecimento.
                    </>
                  ) : (
                    'Nenhuma retirada agendada para análise de fluxo.'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}