import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, Upload, Filter, Map, Moon, Sun } from "lucide-react";
import OrderCard from "./OrderCard";
import FileUpload from "./FileUpload";
import FilterBar, { type FilterOptions } from "./FilterBar";
import MapViewer from "./MapViewer";
import type { Order } from "@shared/schema";

export default function OrderDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [darkMode, setDarkMode] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // TODO: Remove mock functionality - replace with real data from backend
  const mockOrders: Order[] = [
    {
      id: "1",
      codigoPedido: "PED001",
      situacaoFiscal: "Faturado",
      pessoa: "12345",
      nomePessoa: "João Silva Santos",
      papel: "Cliente Premium",
      qtdeItens: 15,
      valorPedido: "2450.75",
      tipoEntrega: "No endereço da entrega",
      situacaoComercial: "Aprovado",
      dataAprovacao: new Date("2024-01-15T14:30:00"),
      previsaoEntrega: new Date("2024-01-22T00:00:00"),
      cicloCaptacao: "13/2024",
      diaCiclo: 5,
      planoPagamento: "BOLETO Pago via Pix",
      logradouro: "Rua das Flores, 123",
      complemento: "Apto 45",
      bairro: "Vila Madalena",
      cidade: "São Paulo",
      uf: "SP",
      cep: "05434-000",
      referencia: "Próximo ao shopping",
      bairroEntregaRetirada: null,
      cidadeEntregaRetirada: null,
      referenciaEntregaRetirada: null,
      telefone: "(11) 99999-8888",
      responsavelEstrutura: "Maria Costa",
      usuarioFinalizacao: "Carlos Santos"
    },
    {
      id: "2",
      codigoPedido: "PED002",
      situacaoFiscal: "Não Faturado",
      pessoa: "67890",
      nomePessoa: "Ana Paula Oliveira",
      papel: "Cliente Regular",
      qtdeItens: 8,
      valorPedido: "890.50",
      tipoEntrega: "Retirar na central de serviço",
      situacaoComercial: "Pendente",
      dataAprovacao: null,
      previsaoEntrega: new Date("2024-01-25T00:00:00"),
      cicloCaptacao: "14/2024",
      diaCiclo: 2,
      planoPagamento: "Parcelado Pendente",
      logradouro: "Av. Paulista, 1000",
      complemento: "Sala 502",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      uf: "SP",
      cep: "01310-100",
      referencia: "Edifício comercial",
      bairroEntregaRetirada: "Centro",
      cidadeEntregaRetirada: "São Paulo",
      referenciaEntregaRetirada: "Loja matriz - Rua do Comércio",
      telefone: "(11) 88888-7777",
      responsavelEstrutura: "Pedro Lima",
      usuarioFinalizacao: null
    },
    {
      id: "3",
      codigoPedido: "PED003",
      situacaoFiscal: "Faturado",
      pessoa: "11111",
      nomePessoa: "Roberto Carlos da Silva",
      papel: "Cliente VIP",
      qtdeItens: 25,
      valorPedido: "5670.80",
      tipoEntrega: "No endereço da entrega",
      situacaoComercial: "Aprovado",
      dataAprovacao: new Date("2024-01-10T09:15:00"),
      previsaoEntrega: new Date("2024-01-20T00:00:00"),
      cicloCaptacao: "13/2024",
      diaCiclo: 8,
      planoPagamento: "Cartão de Crédito ON-LINE",
      logradouro: "Rua Augusta, 500",
      complemento: null,
      bairro: "Consolação",
      cidade: "São Paulo",
      uf: "SP",
      cep: "01305-000",
      referencia: "Próximo ao metrô",
      bairroEntregaRetirada: null,
      cidadeEntregaRetirada: null,
      referenciaEntregaRetirada: null,
      telefone: "(11) 77777-6666",
      responsavelEstrutura: "Laura Mendes",
      usuarioFinalizacao: "Ana Silva"
    }
  ];

  useState(() => {
    setOrders(mockOrders);
    setFilteredOrders(mockOrders);
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    console.log('Dark mode toggled:', !darkMode);
  };

  const handleFileProcessed = (processedOrders: any[]) => {
    // TODO: Remove mock functionality - integrate with backend API
    console.log('File processed, orders received:', processedOrders);
    setOrders([...orders, ...processedOrders]);
    setFilteredOrders([...orders, ...processedOrders]);
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
              Pedidos
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
              onFilterChange={handleFilterChange} 
              totalOrders={filteredOrders.length}
            />
            
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <LayoutGrid className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Nenhum pedido encontrado</h3>
                  <p className="text-muted-foreground">
                    Importe uma planilha Excel ou ajuste os filtros para ver os pedidos.
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
            ) : (
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