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
}

export default function FilterBar({ onFilterChange, totalOrders = 0 }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    situacaoFiscal: "",
    situacaoComercial: "",
    tipoEntrega: "",
  });


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
    <Card className="backdrop-blur-xl bg-card/60 dark:bg-card/50 border border-border/40 shadow-2xl relative overflow-hidden">
      {/* Glass reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-chart-1/5 dark:from-white/5 dark:to-chart-1/10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/40" />
      
      <CardContent className="p-6 relative z-10">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={filters.situacaoFiscal}
              onValueChange={(value) => updateFilter('situacaoFiscal', value)}
            >
              <SelectTrigger data-testid="select-fiscal-status">
                <SelectValue placeholder="Situação Fiscal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="nf-emitida">NF Emitida</SelectItem>
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
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="transporte">Transporte</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="captacao">Captação</SelectItem>
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
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="retirada">Retirada na Loja</SelectItem>
                <SelectItem value="entrega">Entrega em Casa</SelectItem>
              </SelectContent>
            </Select>

          </div>


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