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
