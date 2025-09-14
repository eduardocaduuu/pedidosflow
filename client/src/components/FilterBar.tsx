import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X, Calendar, MapPin, CreditCard, User } from "lucide-react";

interface FilterBarProps {
  onFilterChange?: (filters: FilterOptions) => void;
  totalOrders?: number;
}

export interface FilterOptions {
  search: string;
  situacaoFiscal: string;
  situacaoComercial: string;
  tipoEntrega: string;
  planoPagamento: string;
  ciclo: string;
  valorMin: string;
  valorMax: string;
}

export default function FilterBar({ onFilterChange, totalOrders = 0 }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    situacaoFiscal: "",
    situacaoComercial: "",
    tipoEntrega: "",
    planoPagamento: "",
    ciclo: "",
    valorMin: "",
    valorMax: "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
    console.log('Filter updated:', key, value);
  };

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {
      search: "",
      situacaoFiscal: "",
      situacaoComercial: "",
      tipoEntrega: "",
      planoPagamento: "",
      ciclo: "",
      valorMin: "",
      valorMax: "",
    };
    setFilters(emptyFilters);
    onFilterChange?.(emptyFilters);
    console.log('Filters cleared');
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== "").length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Filtros</h3>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" data-testid="badge-active-filters">
                  {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground" data-testid="text-total-orders">
                {totalOrders} pedidos
              </span>
              {activeFiltersCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  data-testid="button-clear-filters"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, cliente, funcionário..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50"
              data-testid="input-search"
            />
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Select 
              value={filters.situacaoFiscal} 
              onValueChange={(value) => updateFilter('situacaoFiscal', value)}
            >
              <SelectTrigger data-testid="select-fiscal-status">
                <SelectValue placeholder="Situação Fiscal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="faturado">Faturado</SelectItem>
                <SelectItem value="nao-faturado">Não Faturado</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.situacaoComercial} 
              onValueChange={(value) => updateFilter('situacaoComercial', value)}
            >
              <SelectTrigger data-testid="select-commercial-status">
                <SelectValue placeholder="Status Comercial" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.tipoEntrega} 
              onValueChange={(value) => updateFilter('tipoEntrega', value)}
            >
              <SelectTrigger data-testid="select-delivery-type">
                <SelectValue placeholder="Tipo de Entrega" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="retirada">Retirada na Loja</SelectItem>
                <SelectItem value="entrega">Entrega em Casa</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.planoPagamento} 
              onValueChange={(value) => updateFilter('planoPagamento', value)}
            >
              <SelectTrigger data-testid="select-payment-plan">
                <SelectValue placeholder="Pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
              data-testid="button-advanced-filters"
            >
              <Filter className="h-4 w-4" />
              Avançado
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-card/30 rounded-lg backdrop-blur-sm border border-border/50">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Ciclo de Captação
                </label>
                <Input
                  placeholder="Ex: 13, 14..."
                  value={filters.ciclo}
                  onChange={(e) => updateFilter('ciclo', e.target.value)}
                  data-testid="input-cycle"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Valor Mínimo
                </label>
                <Input
                  type="number"
                  placeholder="R$ 0,00"
                  value={filters.valorMin}
                  onChange={(e) => updateFilter('valorMin', e.target.value)}
                  data-testid="input-min-value"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Valor Máximo
                </label>
                <Input
                  type="number"
                  placeholder="R$ 10.000,00"
                  value={filters.valorMax}
                  onChange={(e) => updateFilter('valorMax', e.target.value)}
                  data-testid="input-max-value"
                />
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  "{filters.search}"
                  <button 
                    onClick={() => updateFilter('search', '')}
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              )}
              {filters.situacaoFiscal && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Fiscal: {filters.situacaoFiscal}
                  <button onClick={() => updateFilter('situacaoFiscal', '')}>
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              )}
              {filters.situacaoComercial && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Comercial: {filters.situacaoComercial}
                  <button onClick={() => updateFilter('situacaoComercial', '')}>
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              )}
              {filters.tipoEntrega && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {filters.tipoEntrega}
                  <button onClick={() => updateFilter('tipoEntrega', '')}>
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}