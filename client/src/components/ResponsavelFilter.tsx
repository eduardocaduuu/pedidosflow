import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, ChevronDown, X } from "lucide-react";
import type { Order } from "@shared/schema";

interface ResponsavelFilterProps {
  orders: Order[];
  selectedResponsavel: string | null;
  onResponsavelChange: (responsavel: string | null) => void;
}

export default function ResponsavelFilter({
  orders,
  selectedResponsavel,
  onResponsavelChange,
}: ResponsavelFilterProps) {
  // Get unique responsaveis and their order counts
  const responsavelStats = orders.reduce((acc, order) => {
    const responsavel = order.responsavelEstrutura;
    if (!acc[responsavel]) {
      acc[responsavel] = 0;
    }
    acc[responsavel]++;
    return acc;
  }, {} as Record<string, number>);

  const sortedResponsaveis = Object.entries(responsavelStats)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([responsavel, count]) => ({ responsavel, count }));

  const clearFilter = () => {
    onResponsavelChange(null);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-card/60 border-border/50 hover:bg-card/80"
          >
            <User className="h-4 w-4 mr-2" />
            {selectedResponsavel || "Filtrar por Responsável"}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          <div className="p-2">
            <div className="text-sm font-medium mb-2">Responsável por Estrutura</div>
            <div className="text-xs text-muted-foreground mb-3">
              Selecione para filtrar pedidos por responsável
            </div>
          </div>
          <DropdownMenuSeparator />
          {sortedResponsaveis.map(({ responsavel, count }) => (
            <DropdownMenuItem
              key={responsavel}
              onClick={() => onResponsavelChange(responsavel)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="truncate flex-1">{responsavel}</span>
              <Badge variant="secondary" className="ml-2 text-xs">
                {count} pedido{count !== 1 ? 's' : ''}
              </Badge>
            </DropdownMenuItem>
          ))}
          {selectedResponsavel && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={clearFilter}
                className="flex items-center text-muted-foreground cursor-pointer"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar filtro
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedResponsavel && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10">
            {selectedResponsavel}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilter}
              className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}
    </div>
  );
}