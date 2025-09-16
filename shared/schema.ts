import { z } from "zod";

export const insertOrderSchema = z.object({
  codigoPedido: z.string(),
  situacaoFiscal: z.string(),
  pessoa: z.string(),
  nomePessoa: z.string(),
  papel: z.string(),
  qtdeItens: z.number(),
  valorPedido: z.string(),
  tipoEntrega: z.string(),
  situacaoComercial: z.string(),
  detalheSituacaoComercial: z.string().optional(),
  dataAprovacao: z.date().optional(),
  previsaoEntrega: z.date().optional(),
  cicloCaptacao: z.string(),
  diaCiclo: z.number(),
  planoPagamento: z.string(),
  logradouro: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  cep: z.string().optional(),
  referencia: z.string().optional(),
  bairroEntregaRetirada: z.string().optional(),
  cidadeEntregaRetirada: z.string().optional(),
  referenciaEntregaRetirada: z.string().optional(),
  telefone: z.string().optional(),
  responsavelEstrutura: z.string().optional(),
  usuarioFinalizacao: z.string().optional(),
});

export const orderSchema = insertOrderSchema.extend({
  id: z.string(),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = z.infer<typeof orderSchema>;

export type User = {
  id: string;
  username: string;
  password: string;
};

export type InsertUser = Omit<User, 'id'>;

// Business Logic Functions
export const isPaymentPaid = (planoPagamento: string): boolean => {
  const paidKeywords = ['BOLETO', 'Pix', 'Cartão de Crédito ON-LINE'];
  return paidKeywords.some(keyword => planoPagamento.includes(keyword));
};

export const getDeliveryType = (tipoEntrega: string): 'store_pickup' | 'home_delivery' => {
  return tipoEntrega.includes('Retirar na central de serviço') ? 'store_pickup' : 'home_delivery';
};

export const getValueRanking = (valor: string): { level: string; color: string; priority: number } => {
  const numValue = parseFloat(valor);
  if (numValue > 5000) return { level: "Premium", color: "bg-chart-1", priority: 4 };
  if (numValue > 2000) return { level: "Alto", color: "bg-chart-3", priority: 3 };
  if (numValue > 500) return { level: "Médio", color: "bg-chart-2", priority: 2 };
  return { level: "Básico", color: "bg-muted", priority: 1 };
};

export const getQuantityRanking = (qtde: number): { level: string; priority: number } => {
  if (qtde > 20) return { level: "Alta", priority: 3 };
  if (qtde > 10) return { level: "Média", priority: 2 };
  return { level: "Baixa", priority: 1 };
};

export const getCycleDisplay = (cicloCaptacao: string): string => {
  return cicloCaptacao.substring(0, 2);
};

export const getPersonValueRanking = (papel: string): { level: string; color: string } => {
  const lowerPapel = papel.toLowerCase();
  if (lowerPapel.includes('premium') || lowerPapel.includes('vip')) {
    return { level: "Cliente Premium", color: "bg-chart-1" };
  }
  if (lowerPapel.includes('especial') || lowerPapel.includes('gold')) {
    return { level: "Cliente Especial", color: "bg-chart-3" };
  }
  if (lowerPapel.includes('regular') || lowerPapel.includes('padrão')) {
    return { level: "Cliente Regular", color: "bg-chart-2" };
  }
  return { level: "Cliente", color: "bg-muted" };
};
