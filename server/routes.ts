import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import * as XLSX from "xlsx";
import { storage } from "./storage";
import { insertOrderSchema, type InsertOrder } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {

  // Get all orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Upload and process Excel file
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      // Check file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];

      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Invalid file type. Please upload an Excel file." });
      }

      // Parse Excel file
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        return res.status(400).json({ error: "The Excel file is empty or has no data." });
      }

      // Map Excel columns to our schema
      const orders: InsertOrder[] = [];
      const errors: string[] = [];
      const timestamp = Date.now();

      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i];

        try {
          // Map Excel columns using exact column names from user specification
          const orderData: InsertOrder = {
            codigoPedido: String(row['CodigoPedido'] || row['Código do Pedido'] || `PED${timestamp}-${i}`),
            situacaoFiscal: String(row['SituaçãoFiscal'] || row['Situação Fiscal'] || 'Não informado'),
            pessoa: String(row['Pessoa'] || ''),
            nomePessoa: String(row['NomePessoa'] || row['Nome da Pessoa'] || ''),
            papel: String(row['Papel'] || 'Cliente'),
            qtdeItens: Number(row['QtdeItens'] || row['Quantidade de Itens'] || 0),
            valorPedido: String(row['ValorPedido'] || row['Valor do Pedido'] || '0.00'),
            tipoEntrega: String(row['Tipo de Entrega'] || 'No endereço da entrega'),
            situacaoComercial: String(row['SituaçãoComercial'] || row['Situação Comercial'] || 'Pendente'),
            dataAprovacao: row['Data Aprovação'] || row['Data de Aprovação'] ? new Date(row['Data Aprovação'] || row['Data de Aprovação']) : undefined,
            previsaoEntrega: row['PrevisãoEntrega'] || row['Previsão de Entrega'] ? new Date(row['PrevisãoEntrega'] || row['Previsão de Entrega']) : undefined,
            cicloCaptacao: String(row['Ciclo Captação'] || row['Ciclo de Captação'] || '1/2024'),
            diaCiclo: Number(row['Dia do Ciclo'] || 1),
            planoPagamento: String(row['PlanoPagamento'] || row['Plano de Pagamento'] || 'A vista'),
            logradouro: String(row['Logradouro'] || ''),
            complemento: String(row['Complemento'] || ''),
            bairro: String(row['Bairro'] || ''),
            cidade: String(row['Cidade'] || ''),
            uf: String(row['UF'] || ''),
            cep: String(row['CEP'] || ''),
            referencia: String(row['Referência'] || ''),
            bairroEntregaRetirada: String(row['BairroEntregaRetirada'] || row['Bairro Entrega/Retirada'] || ''),
            cidadeEntregaRetirada: String(row['CidadeEntregaRetirada'] || row['Cidade Entrega/Retirada'] || ''),
            referenciaEntregaRetirada: String(row['ReferênciaEntregaRetirada'] || row['Referência Entrega/Retirada'] || ''),
            telefone: String(row['Telefone'] || ''),
            responsavelEstrutura: String(row['Responsável Estrutura'] || ''),
            usuarioFinalizacao: String(row['Usuário de Finalização'] || '')
          };

          // Validate the data
          const validatedOrder = insertOrderSchema.parse(orderData);
          orders.push(validatedOrder);

        } catch (error) {
          if (error instanceof z.ZodError) {
            errors.push(`Row ${i + 2}: ${error.errors.map(e => e.message).join(', ')}`);
          } else {
            errors.push(`Row ${i + 2}: Invalid data format`);
          }
        }
      }

      if (orders.length === 0) {
        return res.status(400).json({
          error: "No valid orders found in the file",
          details: errors
        });
      }

      // Save orders to storage
      const savedOrders = await storage.createOrders(orders);

      res.json({
        message: "File processed successfully",
        ordersProcessed: savedOrders.length,
        totalRows: jsonData.length,
        errors: errors.length > 0 ? errors : undefined
      });

    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).json({
        error: "Failed to process file",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Delete all orders (for testing)
  app.delete("/api/orders", async (req, res) => {
    try {
      await storage.deleteAllOrders();
      res.json({ message: "All orders deleted successfully" });
    } catch (error) {
      console.error("Error deleting orders:", error);
      res.status(500).json({ error: "Failed to delete orders" });
    }
  });

  // Get single order
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}