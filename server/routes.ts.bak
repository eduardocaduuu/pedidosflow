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

      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i];
        
        try {
          // Map Excel columns to our fields - adjust these mappings based on your Excel structure
          const orderData: InsertOrder = {
            codigoPedido: String(row['Código do Pedido'] || row['codigoPedido'] || `PED${Date.now()}-${i}`),
            situacaoFiscal: String(row['Situação Fiscal'] || row['situacaoFiscal'] || 'Não informado'),
            pessoa: String(row['Pessoa'] || row['pessoa'] || ''),
            nomePessoa: String(row['Nome da Pessoa'] || row['nomePessoa'] || ''),
            papel: String(row['Papel'] || row['papel'] || 'Cliente'),
            qtdeItens: Number(row['Quantidade de Itens'] || row['qtdeItens'] || 0),
            valorPedido: String(row['Valor do Pedido'] || row['valorPedido'] || '0.00'),
            tipoEntrega: String(row['Tipo de Entrega'] || row['tipoEntrega'] || 'No endereço da entrega'),
            situacaoComercial: String(row['Situação Comercial'] || row['situacaoComercial'] || 'Pendente'),
            dataAprovacao: row['Data de Aprovação'] || row['dataAprovacao'] ? new Date(row['Data de Aprovação'] || row['dataAprovacao']) : undefined,
            previsaoEntrega: row['Previsão de Entrega'] || row['previsaoEntrega'] ? new Date(row['Previsão de Entrega'] || row['previsaoEntrega']) : undefined,
            cicloCaptacao: String(row['Ciclo de Captação'] || row['cicloCaptacao'] || '1/2024'),
            diaCiclo: Number(row['Dia do Ciclo'] || row['diaCiclo'] || 1),
            planoPagamento: String(row['Plano de Pagamento'] || row['planoPagamento'] || 'A vista'),
            logradouro: String(row['Logradouro'] || row['logradouro'] || ''),
            complemento: String(row['Complemento'] || row['complemento'] || ''),
            bairro: String(row['Bairro'] || row['bairro'] || ''),
            cidade: String(row['Cidade'] || row['cidade'] || ''),
            uf: String(row['UF'] || row['uf'] || ''),
            cep: String(row['CEP'] || row['cep'] || ''),
            referencia: String(row['Referência'] || row['referencia'] || ''),
            bairroEntregaRetirada: String(row['Bairro Entrega/Retirada'] || row['bairroEntregaRetirada'] || ''),
            cidadeEntregaRetirada: String(row['Cidade Entrega/Retirada'] || row['cidadeEntregaRetirada'] || ''),
            referenciaEntregaRetirada: String(row['Referência Entrega/Retirada'] || row['referenciaEntregaRetirada'] || ''),
            telefone: String(row['Telefone'] || row['telefone'] || ''),
            responsavelEstrutura: String(row['Responsável Estrutura'] || row['responsavelEstrutura'] || ''),
            usuarioFinalizacao: String(row['Usuário Finalização'] || row['usuarioFinalizacao'] || '')
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
