import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  codigoPedido: text("codigo_pedido").notNull().unique(),
  situacaoFiscal: text("situacao_fiscal").notNull(),
  pessoa: text("pessoa").notNull(),
  nomePessoa: text("nome_pessoa").notNull(),
  papel: text("papel").notNull(),
  qtdeItens: integer("qtde_itens").notNull(),
  valorPedido: decimal("valor_pedido", { precision: 10, scale: 2 }).notNull(),
  tipoEntrega: text("tipo_entrega").notNull(),
  situacaoComercial: text("situacao_comercial").notNull(),
  dataAprovacao: timestamp("data_aprovacao"),
  previsaoEntrega: timestamp("previsao_entrega"),
  cicloCaptacao: text("ciclo_captacao").notNull(),
  diaCiclo: integer("dia_ciclo").notNull(),
  planoPagamento: text("plano_pagamento").notNull(),
  logradouro: text("logradouro"),
  complemento: text("complemento"),
  bairro: text("bairro"),
  cidade: text("cidade"),
  uf: text("uf"),
  cep: text("cep"),
  referencia: text("referencia"),
  bairroEntregaRetirada: text("bairro_entrega_retirada"),
  cidadeEntregaRetirada: text("cidade_entrega_retirada"),
  referenciaEntregaRetirada: text("referencia_entrega_retirada"),
  telefone: text("telefone"),
  responsavelEstrutura: text("responsavel_estrutura"),
  usuarioFinalizacao: text("usuario_finalizacao"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
