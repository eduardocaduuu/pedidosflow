import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, Upload, Filter, Map, Moon, Sun, Loader2 } from "lucide-react";
import OrderCard from "./OrderCard";
import FileUpload from "./FileUpload";
import FilterBar, { type FilterOptions } from "./FilterBar";
import OrderStatistics from "./OrderStatistics";
import MapViewer from "./MapViewer";
import type { Order } from "@shared/schema";

export default function OrderDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [darkMode, setDarkMode] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load orders from API
  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const ordersData = await response.json();

      // Convert date strings back to Date objects
      const processedOrders = ordersData.map((order: any) => ({
        ...order,
        dataAprovacao: order.dataAprovacao ? new Date(order.dataAprovacao) : undefined,
        previsaoEntrega: order.previsaoEntrega ? new Date(order.previsaoEntrega) : undefined
      }));

      setOrders(processedOrders);
      setFilteredOrders(processedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError(error instanceof Error ? error.message : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Load orders on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    console.log('Dark mode toggled:', !darkMode);
  };

  const handleFileProcessed = async () => {
    console.log('File processed, refreshing orders list');
    await loadOrders();
    setActiveTab("orders");
  };

  const handleFilterChange = (filters: FilterOptions) => {
    let filtered = [...orders];

    if (filters.search) {
      filtered = filtered.filter(order =>
        order.codigoPedido.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.nomePessoa.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.responsavelEstrutura?.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.usuarioFinalizacao?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.situacaoFiscal && filters.situacaoFiscal !== "todos") {
      filtered = filtered.filter(order => {
        if (filters.situacaoFiscal === "faturado") {
          return order.situacaoFiscal.toLowerCase().includes("faturado");
        }
        if (filters.situacaoFiscal === "nao-faturado") {
          return !order.situacaoFiscal.toLowerCase().includes("faturado");
        }
        return true;
      });
    }

    if (filters.situacaoComercial && filters.situacaoComercial !== "todos") {
      filtered = filtered.filter(order => {
        if (filters.situacaoComercial === "aprovado") {
          return order.situacaoComercial.toLowerCase().includes("aprovado");
        }
        if (filters.situacaoComercial === "pendente") {
          return !order.situacaoComercial.toLowerCase().includes("aprovado");
        }
        return true;
      });
    }

    if (filters.tipoEntrega && filters.tipoEntrega !== "todos") {
      filtered = filtered.filter(order => {
        if (filters.tipoEntrega === "retirada") {
          return order.tipoEntrega.includes("Retirar na central");
        }
        if (filters.tipoEntrega === "entrega") {
          return order.tipoEntrega.includes("endereço da entrega");
        }
        return true;
      });
    }

    setFilteredOrders(filtered);
    console.log('Filtered orders:', filtered.length, 'of', orders.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-chart-3/10 relative">
      {/* Glass background overlay */}
      <div className="fixed inset-0 backdrop-blur-xs bg-gradient-to-br from-white/20 via-transparent to-primary/5 dark:from-background/20 dark:to-primary/10 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-card/70 dark:bg-card/60 border-b border-border/30 shadow-2xl">
        <div className="container mx-auto px-6 py-4 relative">
          {/* Glass reflection effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5 pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-chart-3 to-chart-1 bg-clip-text text-transparent tracking-tight" data-testid="text-app-title">
                Sistema de Gestão de Pedidos
              </h1>
              <p className="text-sm text-muted-foreground font-light tracking-wide">
                Design profissional com estilo vintage moderno
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="rounded-full backdrop-blur-md bg-white/20 dark:bg-gray-800/30 border border-white/30 hover:bg-white/30 hover:scale-105 transition-all duration-300"
                data-testid="button-theme-toggle"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Tab Navigation */}
          <TabsList className="grid w-full max-w-md grid-cols-3 backdrop-blur-xl bg-card/60 dark:bg-card/50 border border-border/40 shadow-xl relative overflow-hidden">
            {/* Glass shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/30" />
            <TabsTrigger value="upload" className="flex items-center gap-2" data-testid="tab-upload">
              <Upload className="h-4 w-4" />
              Importar
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2" data-testid="tab-orders">
              <LayoutGrid className="h-4 w-4" />
              Pedidos {orders.length > 0 && `(${orders.length})`}
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2" data-testid="tab-map">
              <Map className="h-4 w-4" />
              Mapa
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <FileUpload onFileProcessed={handleFileProcessed} />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <FilterBar
            {/* Statistics Card */}
            {orders.length > 0 && (
              <OrderStatistics orders={orders} />
            )}
              onFilterChange={handleFilterChange}
              totalOrders={filteredOrders.length}
            />

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12 space-y-4">
                <Loader2 className="h-16 w-16 mx-auto text-muted-foreground animate-spin" />
                <div>
                  <h3 className="text-lg font-semibold">Carregando pedidos...</h3>
                  <p className="text-muted-foreground">
                    Aguarde enquanto buscamos os dados.
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12 space-y-4">
                <div className="text-destructive">
                  <h3 className="text-lg font-semibold">Erro ao carregar pedidos</h3>
                  <p className="text-muted-foreground">{error}</p>
                </div>
                <Button variant="outline" onClick={loadOrders}>
                  Tentar Novamente
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredOrders.length === 0 && orders.length === 0 && (
              <div className="text-center py-12 space-y-4">
                <LayoutGrid className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Nenhum pedido encontrado</h3>
                  <p className="text-muted-foreground">
                    Importe uma planilha Excel para começar a gerenciar seus pedidos.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("upload")}
                  data-testid="button-go-to-upload"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Pedidos
                </Button>
              </div>
            )}

            {/* No Results from Filter */}
            {!isLoading && !error && filteredOrders.length === 0 && orders.length > 0 && (
              <div className="text-center py-12 space-y-4">
                <Filter className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Nenhum resultado encontrado</h3>
                  <p className="text-muted-foreground">
                    Ajuste os filtros para encontrar os pedidos que procura.
                  </p>
                </div>
              </div>
            )}

            {/* Orders Grid */}
            {!isLoading && !error && filteredOrders.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <div key={order.id} onClick={() => setSelectedOrder(order)}>
                    <OrderCard order={order} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-6">
            {selectedOrder ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOrder(null)}
                    data-testid="button-back-to-orders"
                  >
                    ← Voltar aos Pedidos
                  </Button>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Pedido #{selectedOrder.codigoPedido}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.nomePessoa}
                    </p>
                  </div>
                </div>
                <MapViewer order={selectedOrder} />
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <Map className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Selecione um pedido</h3>
                  <p className="text-muted-foreground">
                    Clique em um pedido na aba "Pedidos" para visualizar sua localização no mapa.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("orders")}
                  data-testid="button-go-to-orders"
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Ver Pedidos
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}