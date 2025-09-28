import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import * as XLSX from "xlsx";
import archiver from "archiver";
import * as xml2js from "xml2js";
import { storage } from "./storage";
import { insertOrderSchema, type InsertOrder, type Order } from "@shared/schema";
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

// Apply filters to orders array
function applyFiltersToOrders(orders: Order[], filters: any): Order[] {
  if (!filters) return orders;

  let filtered = [...orders];

  // Apply ResponsavelFilter
  if (filters.selectedResponsavel) {
    filtered = filtered.filter(order =>
      order.responsavelEstrutura === filters.selectedResponsavel
    );
  }

  // Apply search filter
  if (filters.search) {
    filtered = filtered.filter(order =>
      order.codigoPedido.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.nomePessoa.toLowerCase().includes(filters.search.toLowerCase()) ||
      (order.responsavelEstrutura && order.responsavelEstrutura.toLowerCase().includes(filters.search.toLowerCase()))
    );
  }

  // Apply situacaoFiscal filter
  if (filters.situacaoFiscal && filters.situacaoFiscal !== "todos") {
    filtered = filtered.filter(order => {
      const statusLower = order.situacaoFiscal.toLowerCase().trim();

      if (filters.situacaoFiscal === "nf-emitida") {
        return statusLower.includes("nf emitida") || statusLower.includes("nota fiscal emitida");
      }
      if (filters.situacaoFiscal === "faturado") {
        return statusLower === "faturado";
      }
      if (filters.situacaoFiscal === "nao-faturado") {
        return statusLower.includes("nao faturado") || statusLower.includes("não faturado");
      }
      return true;
    });
  }

  // Apply situacaoComercial filter
  if (filters.situacaoComercial && filters.situacaoComercial !== "todos") {
    filtered = filtered.filter(order => {
      const statusCommercial = order.situacaoComercial.toLowerCase().trim();

      if (filters.situacaoComercial === "transporte") {
        return statusCommercial.includes("transporte");
      }
      if (filters.situacaoComercial === "cancelado") {
        return statusCommercial.includes("cancelado");
      }
      if (filters.situacaoComercial === "entregue") {
        return statusCommercial.includes("entregue");
      }
      if (filters.situacaoComercial === "aprovado") {
        return statusCommercial.includes("aprovado");
      }
      if (filters.situacaoComercial === "captacao") {
        return statusCommercial.includes("captacao") || statusCommercial.includes("captação");
      }
      return true;
    });
  }

  // Apply tipoEntrega filter
  if (filters.tipoEntrega && filters.tipoEntrega !== "todos") {
    filtered = filtered.filter(order => {
      const tipoEntrega = order.tipoEntrega.toLowerCase().trim();

      if (filters.tipoEntrega === "retirada") {
        return tipoEntrega.includes("retirar na central de serviço") ||
               tipoEntrega.includes("retirar na central de servico") ||
               tipoEntrega.includes("retirar na central de serviços") ||
               tipoEntrega.includes("retirar na central de servicos") ||
               tipoEntrega.includes("central de serviço") ||
               tipoEntrega.includes("central de servico") ||
               tipoEntrega.includes("central de serviços") ||
               tipoEntrega.includes("central de servicos");
      }

      if (filters.tipoEntrega === "entrega") {
        return tipoEntrega.includes("no endereço da entrega") ||
               tipoEntrega.includes("no endereco da entrega") ||
               tipoEntrega.includes("endereço da entrega") ||
               tipoEntrega.includes("endereco da entrega") ||
               tipoEntrega.includes("endereço de entrega") ||
               tipoEntrega.includes("endereco de entrega") ||
               (!tipoEntrega.includes("retirar") && !tipoEntrega.includes("central"));
      }

      return true;
    });
  }

  return filtered;
}

// Convert orders to CSV format for Tableau
function convertOrdersToCSV(orders: Order[]): string {
  if (orders.length === 0) return '';

  const headers = [
    'ID', 'Código do Pedido', 'Situação Fiscal', 'Pessoa', 'Nome da Pessoa', 'Papel',
    'Quantidade de Itens', 'Valor do Pedido', 'Tipo de Entrega', 'Situação Comercial',
    'Detalhe Situação Comercial', 'Data de Aprovação', 'Previsão de Entrega',
    'Ciclo de Captação', 'Dia do Ciclo', 'Plano de Pagamento', 'Logradouro',
    'Complemento', 'Bairro', 'Cidade', 'UF', 'CEP', 'Referência',
    'Bairro Entrega/Retirada', 'Cidade Entrega/Retirada', 'Referência Entrega/Retirada',
    'Telefone', 'Responsável Estrutura', 'Usuário de Finalização'
  ];

  const csvRows = [headers.join(',')];

  orders.forEach(order => {
    const row = [
      order.id || '',
      `"${(order.codigoPedido || '').replace(/"/g, '""')}"`,
      `"${(order.situacaoFiscal || '').replace(/"/g, '""')}"`,
      `"${(order.pessoa || '').replace(/"/g, '""')}"`,
      `"${(order.nomePessoa || '').replace(/"/g, '""')}"`,
      `"${(order.papel || '').replace(/"/g, '""')}"`,
      order.qtdeItens || 0,
      `"${(order.valorPedido || '').replace(/"/g, '""')}"`,
      `"${(order.tipoEntrega || '').replace(/"/g, '""')}"`,
      `"${(order.situacaoComercial || '').replace(/"/g, '""')}"`,
      `"${(order.detalheSituacaoComercial || '').replace(/"/g, '""')}"`,
      order.dataAprovacao ? `"${new Date(order.dataAprovacao).toISOString()}"` : '',
      order.previsaoEntrega ? `"${new Date(order.previsaoEntrega).toISOString()}"` : '',
      `"${(order.cicloCaptacao || '').replace(/"/g, '""')}"`,
      order.diaCiclo || 0,
      `"${(order.planoPagamento || '').replace(/"/g, '""')}"`,
      `"${(order.logradouro || '').replace(/"/g, '""')}"`,
      `"${(order.complemento || '').replace(/"/g, '""')}"`,
      `"${(order.bairro || '').replace(/"/g, '""')}"`,
      `"${(order.cidade || '').replace(/"/g, '""')}"`,
      `"${(order.uf || '').replace(/"/g, '""')}"`,
      `"${(order.cep || '').replace(/"/g, '""')}"`,
      `"${(order.referencia || '').replace(/"/g, '""')}"`,
      `"${(order.bairroEntregaRetirada || '').replace(/"/g, '""')}"`,
      `"${(order.cidadeEntregaRetirada || '').replace(/"/g, '""')}"`,
      `"${(order.referenciaEntregaRetirada || '').replace(/"/g, '""')}"`,
      `"${(order.telefone || '').replace(/"/g, '""')}"`,
      `"${(order.responsavelEstrutura || '').replace(/"/g, '""')}"`,
      `"${(order.usuarioFinalizacao || '').replace(/"/g, '""')}"`,
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

// Generate Tableau datasource XML
function generateTableauDatasource(orders: Order[]): string {
  return `<?xml version='1.0' encoding='utf-8' ?>
<datasource formatted-name='pedidos.csv' inline='true' source-platform='text' version='10.5' xmlns:user='http://www.tableausoftware.com/xml/user'>
  <connection class='textfile' directory='' filename='pedidos.csv' password='' server='' />
  <aliases enabled='yes' />
  <column datatype='string' name='ID' ordinal='0' />
  <column datatype='string' name='Código do Pedido' ordinal='1' />
  <column datatype='string' name='Situação Fiscal' ordinal='2' />
  <column datatype='string' name='Pessoa' ordinal='3' />
  <column datatype='string' name='Nome da Pessoa' ordinal='4' />
  <column datatype='string' name='Papel' ordinal='5' />
  <column datatype='integer' name='Quantidade de Itens' ordinal='6' />
  <column datatype='string' name='Valor do Pedido' ordinal='7' />
  <column datatype='string' name='Tipo de Entrega' ordinal='8' />
  <column datatype='string' name='Situação Comercial' ordinal='9' />
  <column datatype='string' name='Detalhe Situação Comercial' ordinal='10' />
  <column datatype='datetime' name='Data de Aprovação' ordinal='11' />
  <column datatype='datetime' name='Previsão de Entrega' ordinal='12' />
  <column datatype='string' name='Ciclo de Captação' ordinal='13' />
  <column datatype='integer' name='Dia do Ciclo' ordinal='14' />
  <column datatype='string' name='Plano de Pagamento' ordinal='15' />
  <column datatype='string' name='Logradouro' ordinal='16' />
  <column datatype='string' name='Complemento' ordinal='17' />
  <column datatype='string' name='Bairro' ordinal='18' />
  <column datatype='string' name='Cidade' ordinal='19' />
  <column datatype='string' name='UF' ordinal='20' />
  <column datatype='string' name='CEP' ordinal='21' />
  <column datatype='string' name='Referência' ordinal='22' />
  <column datatype='string' name='Bairro Entrega/Retirada' ordinal='23' />
  <column datatype='string' name='Cidade Entrega/Retirada' ordinal='24' />
  <column datatype='string' name='Referência Entrega/Retirada' ordinal='25' />
  <column datatype='string' name='Telefone' ordinal='26' />
  <column datatype='string' name='Responsável Estrutura' ordinal='27' />
  <column datatype='string' name='Usuário de Finalização' ordinal='28' />
  <layout dim-ordering='alphabetic' dim-percentage='0.5' measure-ordering='alphabetic' measure-percentage='0.4' show-structure='true' />
  <semantic-values>
    <semantic-value key='[Country].[Name]' value='"Brasil"' />
  </semantic-values>
</datasource>`;
}

// Generate Tableau workbook XML
function generateTableauWorkbook(dashboardName: string): string {
  return `<?xml version='1.0' encoding='utf-8' ?>
<workbook source-build='10.5.0 (20200219.1354.1055)' source-platform='win' version='10.5' xmlns:user='http://www.tableausoftware.com/xml/user'>
  <preferences>
    <preference name='ui.encoding.shelf.height' value='24' />
    <preference name='ui.shelf.height' value='26' />
  </preferences>
  <datasources>
    <datasource caption='pedidos' inline='true' name='federated.0123456789' version='10.5'>
      <connection class='federated'>
        <named-connections>
          <named-connection caption='pedidos' name='textscan.0123456789'>
            <connection class='textscan' directory='' filename='pedidos.csv' password='' server='' />
          </named-connection>
        </named-connections>
        <relation connection='textscan.0123456789' name='pedidos.csv' table='[pedidos#csv]' type='table'>
          <columns character-set='UTF-8' header='yes' locale='en_US' separator=','>
            <column datatype='string' name='ID' ordinal='0' />
            <column datatype='string' name='Código do Pedido' ordinal='1' />
            <column datatype='string' name='Situação Fiscal' ordinal='2' />
            <column datatype='string' name='Pessoa' ordinal='3' />
            <column datatype='string' name='Nome da Pessoa' ordinal='4' />
            <column datatype='string' name='Papel' ordinal='5' />
            <column datatype='integer' name='Quantidade de Itens' ordinal='6' />
            <column datatype='string' name='Valor do Pedido' ordinal='7' />
            <column datatype='string' name='Tipo de Entrega' ordinal='8' />
            <column datatype='string' name='Situação Comercial' ordinal='9' />
            <column datatype='string' name='Detalhe Situação Comercial' ordinal='10' />
            <column datatype='string' name='Data de Aprovação' ordinal='11' />
            <column datatype='string' name='Previsão de Entrega' ordinal='12' />
            <column datatype='string' name='Ciclo de Captação' ordinal='13' />
            <column datatype='integer' name='Dia do Ciclo' ordinal='14' />
            <column datatype='string' name='Plano de Pagamento' ordinal='15' />
            <column datatype='string' name='Logradouro' ordinal='16' />
            <column datatype='string' name='Complemento' ordinal='17' />
            <column datatype='string' name='Bairro' ordinal='18' />
            <column datatype='string' name='Cidade' ordinal='19' />
            <column datatype='string' name='UF' ordinal='20' />
            <column datatype='string' name='CEP' ordinal='21' />
            <column datatype='string' name='Referência' ordinal='22' />
            <column datatype='string' name='Bairro Entrega/Retirada' ordinal='23' />
            <column datatype='string' name='Cidade Entrega/Retirada' ordinal='24' />
            <column datatype='string' name='Referência Entrega/Retirada' ordinal='25' />
            <column datatype='string' name='Telefone' ordinal='26' />
            <column datatype='string' name='Responsável Estrutura' ordinal='27' />
            <column datatype='string' name='Usuário de Finalização' ordinal='28' />
          </columns>
        </relation>
        <metadata-records>
          <metadata-record class='capability'>
            <remote-name />
            <remote-type>0</remote-type>
            <parent-name>[pedidos.csv]</parent-name>
            <remote-alias />
            <aggregation>Count</aggregation>
            <contains-null>true</contains-null>
            <attributes>
              <attribute datatype='string' name='character-set'>&quot;UTF-8&quot;</attribute>
              <attribute datatype='string' name='collation'>&quot;en_US&quot;</attribute>
              <attribute datatype='string' name='field-delimiter'>&quot;,&quot;</attribute>
              <attribute datatype='string' name='header-row'>&quot;true&quot;</attribute>
              <attribute datatype='string' name='locale'>&quot;en_US&quot;</attribute>
              <attribute datatype='string' name='single-char'>&quot;&quot;</attribute>
            </attributes>
          </metadata-record>
        </metadata-records>
      </connection>
      <aliases enabled='yes' />
      <column datatype='string' name='[Código do Pedido]' role='dimension' type='nominal' />
      <column datatype='string' name='[Situação Fiscal]' role='dimension' type='nominal' />
      <column datatype='string' name='[Nome da Pessoa]' role='dimension' type='nominal' />
      <column datatype='integer' name='[Quantidade de Itens]' role='measure' type='quantitative' />
      <column datatype='string' name='[Valor do Pedido]' role='dimension' type='nominal' />
      <column datatype='string' name='[Tipo de Entrega]' role='dimension' type='nominal' />
      <column datatype='string' name='[Situação Comercial]' role='dimension' type='nominal' />
      <column datatype='string' name='[Responsável Estrutura]' role='dimension' type='nominal' />
      <layout dim-ordering='alphabetic' dim-percentage='0.5' measure-ordering='alphabetic' measure-percentage='0.4' show-structure='true' />
    </datasource>
  </datasources>
  <worksheets>
    <worksheet name='Sheet 1'>
      <table>
        <view>
          <datasources>
            <datasource caption='pedidos' name='federated.0123456789' />
          </datasources>
          <aggregation value='true' />
        </view>
        <style />
        <panes>
          <pane selection-relaxation-option='selection-relaxation-allow'>
            <view>
              <breakdown value='auto' />
            </view>
            <mark class='Automatic' />
          </pane>
        </panes>
        <rows />
        <cols />
      </table>
    </worksheet>
  </worksheets>
  <windows source-height='30'>
    <window class='worksheet' maximized='true' name='Sheet 1'>
      <cards>
        <edge name='left'>
          <strip size='160'>
            <card type='pages' />
            <card type='filters' />
            <card type='marks' />
          </strip>
        </edge>
        <edge name='top'>
          <strip size='2147483647'>
            <card type='columns' />
          </strip>
          <strip size='2147483647'>
            <card type='rows' />
          </strip>
          <strip size='31'>
            <card type='title' />
          </strip>
        </edge>
      </cards>
    </window>
  </windows>
</workbook>`;
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
            detalheSituacaoComercial: safeString(row['DetalheSituaçãoComercial'] || row['Detalhe Situação Comercial'] || row['DetalheSituacao'] || row['Detalhe da Situação']),
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

  // Export filtered orders to Excel
  app.post("/api/export/excel", async (req, res) => {
    try {
      const { filters, filename } = req.body;

      // Get all orders from storage and apply filters
      const allOrders = await storage.getAllOrders();
      const filteredOrders = applyFiltersToOrders(allOrders, filters);

      // Prepare data for Excel export
      const excelData = filteredOrders.map((order: Order) => ({
        'Código do Pedido': order.codigoPedido,
        'Situação Fiscal': order.situacaoFiscal,
        'Pessoa': order.pessoa,
        'Nome da Pessoa': order.nomePessoa,
        'Papel': order.papel,
        'Quantidade de Itens': order.qtdeItens,
        'Valor do Pedido': order.valorPedido,
        'Tipo de Entrega': order.tipoEntrega,
        'Situação Comercial': order.situacaoComercial,
        'Detalhe Situação Comercial': order.detalheSituacaoComercial || '',
        'Data de Aprovação': order.dataAprovacao ? new Date(order.dataAprovacao).toLocaleDateString('pt-BR') : '',
        'Previsão de Entrega': order.previsaoEntrega ? new Date(order.previsaoEntrega).toLocaleDateString('pt-BR') : '',
        'Ciclo de Captação': order.cicloCaptacao,
        'Dia do Ciclo': order.diaCiclo,
        'Plano de Pagamento': order.planoPagamento,
        'Logradouro': order.logradouro || '',
        'Complemento': order.complemento || '',
        'Bairro': order.bairro || '',
        'Cidade': order.cidade || '',
        'UF': order.uf || '',
        'CEP': order.cep || '',
        'Referência': order.referencia || '',
        'Bairro Entrega/Retirada': order.bairroEntregaRetirada || '',
        'Cidade Entrega/Retirada': order.cidadeEntregaRetirada || '',
        'Referência Entrega/Retirada': order.referenciaEntregaRetirada || '',
        'Telefone': order.telefone || '',
        'Responsável Estrutura': order.responsavelEstrutura || '',
        'Usuário de Finalização': order.usuarioFinalizacao || ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Pedidos Filtrados");

      // Generate buffer
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      // Set headers for file download
      const downloadFilename = filename || `pedidos_filtrados_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      res.send(buffer);

    } catch (error) {
      console.error("Error exporting Excel:", error);
      res.status(500).json({
        error: "Failed to export Excel file",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Export orders to Tableau (.twbx) format
  app.post("/api/export/tableau", async (req, res) => {
    try {
      const { filters, dashboardName } = req.body;

      // Get all orders from storage
      const allOrders = await storage.getAllOrders();
      const orders = filters ? applyFiltersToOrders(allOrders, filters) : allOrders;

      // Create Tableau data source XML
      const datasourceXml = generateTableauDatasource(orders);

      // Create Tableau workbook XML
      const workbookXml = generateTableauWorkbook(dashboardName || "Dashboard de Pedidos");

      // Create zip archive for .twbx
      const archive = archiver('zip', { zlib: { level: 9 } });

      // Set headers for file download
      const downloadFilename = `${dashboardName || 'dashboard_pedidos'}_${new Date().toISOString().split('T')[0]}.twbx`;
      res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');

      // Pipe archive to response
      archive.pipe(res);

      // Add files to archive
      archive.append(datasourceXml, { name: 'Data/Datasources/pedidos.tds' });
      archive.append(workbookXml, { name: 'workbook.twb' });

      // Create CSV data for Tableau
      const csvData = convertOrdersToCSV(orders);
      archive.append(csvData, { name: 'Data/Datasources/pedidos.csv' });

      // Finalize archive
      await archive.finalize();

    } catch (error) {
      console.error("Error exporting Tableau file:", error);
      res.status(500).json({
        error: "Failed to export Tableau file",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}