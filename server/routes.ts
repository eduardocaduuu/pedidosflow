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

// Safe date parsing function
function parseExcelDate(value: any): Date | undefined {
  if (!value) return undefined;

  try {
    // If it's already a Date object
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? undefined : value;
    }

    // If it's a string
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed ||
          trimmed.toLowerCase() === 'null' ||
          trimmed.toLowerCase() === 'undefined' ||
          trimmed === '' ||
          trimmed === '-') {
        return undefined;
      }

      // Try parsing various date formats
      const date = new Date(trimmed);
      return isNaN(date.getTime()) ? undefined : date;
    }

    // If it's a number (Excel serial date)
    if (typeof value === 'number') {
      // Excel date serial number conversion
      const excelEpoch = new Date(1900, 0, 1);
      const date = new Date(excelEpoch.getTime() + (value - 1) * 24 * 60 * 60 * 1000);
      return isNaN(date.getTime()) ? undefined : date;
    }

    return undefined;
  } catch (error) {
    console.warn('Failed to parse date:', value, error);
    return undefined;
  }
}

// Safe string conversion
function safeString(value: any, defaultValue: string = ''): string {
  if (value === null || value === undefined) return defaultValue;
  return String(value).trim();
}

// Safe number conversion
function safeNumber(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined || value === '') return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

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
      const warnings: string[] = [];
      const timestamp = Date.now();

      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i];

        try {
          // Map Excel columns using exact column names from user specification
          const orderData: InsertOrder = {
            codigoPedido: safeString(row['CodigoPedido'] || row['Código do Pedido'], `PED${timestamp}-${i}`),
            situacaoFiscal: safeString(row['SituaçãoFiscal'] || row['Situação Fiscal'], 'Não informado'),
            pessoa: safeString(row['Pessoa']),
            nomePessoa: safeString(row['NomePessoa'] || row['Nome da Pessoa']),
            papel: safeString(row['Papel'], 'Cliente'),
            qtdeItens: safeNumber(row['QtdeItens'] || row['Quantidade de Itens']),
            valorPedido: safeString(row['ValorPedido'] || row['Valor do Pedido'], '0.00'),
            tipoEntrega: safeString(row['Tipo de Entrega'], 'No endereço da entrega'),
            situacaoComercial: safeString(row['SituaçãoComercial'] || row['Situação Comercial'], 'Pendente'),
            // Safe date parsing
            dataAprovacao: parseExcelDate(row['Data Aprovação'] || row['Data de Aprovação']),
            previsaoEntrega: parseExcelDate(row['PrevisãoEntrega'] || row['Previsão de Entrega']),
            cicloCaptacao: safeString(row['Ciclo Captação'] || row['Ciclo de Captação'], '1/2024'),
            diaCiclo: safeNumber(row['Dia do Ciclo'], 1),
            planoPagamento: safeString(row['PlanoPagamento'] || row['Plano de Pagamento'], 'A vista'),
            logradouro: safeString(row['Logradouro']),
            complemento: safeString(row['Complemento']),
            bairro: safeString(row['Bairro']),
            cidade: safeString(row['Cidade']),
            uf: safeString(row['UF']),
            cep: safeString(row['CEP']),
            referencia: safeString(row['Referência']),
            bairroEntregaRetirada: safeString(row['BairroEntregaRetirada'] || row['Bairro Entrega/Retirada']),
            cidadeEntregaRetirada: safeString(row['CidadeEntregaRetirada'] || row['Cidade Entrega/Retirada']),
            referenciaEntregaRetirada: safeString(row['ReferênciaEntregaRetirada'] || row['Referência Entrega/Retirada']),
            telefone: safeString(row['Telefone']),
            responsavelEstrutura: safeString(row['Responsável Estrutura']),
            usuarioFinalizacao: safeString(
              row['Usuario de Finalização'] ||  // Exact match from Excel
              row['Usuário de Finalização'] ||
              row['Usuario de Finalizacao'] ||
              row['Usuario Finalizacao'] ||
              row['Usuário Finalização'] ||
              row['Usuario de Finalizaçao'] ||
              row['USUÁRIO DE FINALIZAÇÃO'] ||
              row['Usuario de finalizacao'] ||
              ''
            )
          };

          // Validate the data
          const validatedOrder = insertOrderSchema.parse(orderData);
          orders.push(validatedOrder);

          // Check for missing important data and add warnings
          if (!orderData.dataAprovacao && (row['Data Aprovação'] || row['Data de Aprovação'])) {
            warnings.push(`Row ${i + 2}: Invalid approval date format`);
          }
          if (!orderData.previsaoEntrega && (row['PrevisãoEntrega'] || row['Previsão de Entrega'])) {
            warnings.push(`Row ${i + 2}: Invalid delivery forecast date format`);
          }

        } catch (error) {
          if (error instanceof z.ZodError) {
            errors.push(`Row ${i + 2}: ${error.errors.map(e => e.message).join(', ')}`);
          } else {
            errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Invalid data format'}`);
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
        skippedRows: jsonData.length - savedOrders.length,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
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