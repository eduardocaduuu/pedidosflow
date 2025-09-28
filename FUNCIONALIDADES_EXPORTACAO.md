# 📊 Funcionalidades de Exportação - OrderFlowHub

## 🧹 **Sistema de Limpeza de Dados**

A aplicação já possui um sistema robusto de limpeza de dados que funciona da seguinte forma:

### **Sanitização Automática** (arquivo: `server/routes.ts:16-67`)

1. **Parseamento de Datas**: `parseExcelDate()`
   - Converte datas do Excel (números seriais)
   - Suporta strings de data em vários formatos
   - Trata valores nulos/vazios

2. **Limpeza de Strings**: `safeString()`
   - Remove espaços extras
   - Converte null/undefined para strings vazias
   - Aplica valores padrão quando necessário

3. **Conversão de Números**: `safeNumber()`
   - Converte valores para números válidos
   - Trata NaN e valores inválidos
   - Define valores padrão (0)

4. **Mapeamento Inteligente de Colunas**:
   - Suporta múltiplas variações de nomes (ex: "Usuário de Finalização", "Usuario de Finalizacao")
   - Trata acentos e diferentes formatações
   - Mapeia automaticamente para o schema padronizado

5. **Validação com Zod**: Valida a estrutura final dos dados usando schemas tipados

---

## 📤 **Nova Funcionalidade 1: Exportação Excel Filtrado**

### **Como Usar**:
1. Acesse a aba **"Pedidos"**
2. Aplique os filtros desejados (situação fiscal, comercial, responsável, etc.)
3. Clique no botão **"Exportar Excel"** (ícone de planilha)
4. O arquivo será baixado automaticamente com os dados filtrados

### **Características**:
- ✅ **Dados Limpos**: Exporta apenas os dados que passaram pela sanitização
- ✅ **Filtros Aplicados**: Respeita todos os filtros ativos na interface
- ✅ **Formato Original**: Mantém os nomes de colunas em português
- ✅ **Datas Formatadas**: Converte datas para formato brasileiro (DD/MM/AAAA)
- ✅ **Nome Automático**: `pedidos_filtrados_YYYY-MM-DD.xlsx`

### **Implementação Técnica**:
- **Backend**: Endpoint `POST /api/export/excel`
- **Frontend**: Função `handleExportExcel()` em `OrderDashboard.tsx:176-212`
- **Biblioteca**: XLSX para geração de planilhas

---

## 📊 **Nova Funcionalidade 2: Exportação Tableau (.twbx)**

### **Como Usar**:
1. Acesse a aba **"Relatórios"**
2. Visualize as análises disponíveis
3. Clique no botão **"Exportar para Tableau"** (botão de destaque no cabeçalho)
4. O arquivo `.twbx` será baixado automaticamente

### **O que você recebe**:
- 📁 **Arquivo .twbx completo** pronto para abrir no Tableau Desktop
- 📊 **Dashboard pré-configurado** com visualizações básicas
- 📋 **Fonte de dados integrada** com todos os pedidos
- 🇧🇷 **Configuração em português** (localização PT-BR)
- 📈 **Campos tipados** (datas, números, categorias)

### **Estrutura do Arquivo .twbx**:
```
dashboard_pedidos_YYYY-MM-DD.twbx
├── Data/
│   ├── Datasources/
│   │   ├── pedidos.csv (dados)
│   │   └── pedidos.tds (configuração da fonte)
└── workbook.twb (dashboard e worksheets)
```

### **Campos Disponíveis no Tableau**:
- **Dimensões**: Código do Pedido, Situação Fiscal/Comercial, Cliente, Responsável, etc.
- **Medidas**: Quantidade de Itens, Valores (configurados como números)
- **Datas**: Data de Aprovação, Previsão de Entrega (configuradas como datetime)
- **Geográficos**: Cidade, UF, CEP (prontos para mapas)

### **Visualizações Pré-configuradas**:
- Visão geral por situação comercial e fiscal
- Configuração pronta para análises avançadas
- Dashboard responsivo para desktop e tablet

### **Implementação Técnica**:
- **Backend**: Endpoint `POST /api/export/tableau`
- **Frontend**: Função `handleExportTableau()` em `Reports.tsx:49-85`
- **Gerenciamento**: Funções auxiliares para XML e CSV (`server/routes.ts:71-324`)

---

## 🚀 **Como as Funcionalidades se Integram**

### **Fluxo Completo**:
1. **Importação** → Upload Excel com limpeza automática
2. **Filtragem** → Interface interativa para selecionar dados
3. **Exportação Excel** → Dados filtrados e limpos para uso externo
4. **Exportação Tableau** → Análise avançada e visualizações profissionais

### **Vantagens**:
- 🔄 **Dados Consistentes**: Mesma limpeza em importação e exportação
- 🎯 **Filtros Flexíveis**: Exporte apenas o que precisa analisar
- 📊 **Análise Profissional**: Tableau pronto para uso em apresentações
- ⚡ **Processo Rápido**: Download direto do navegador

---

## 🛠️ **Dependências Adicionadas**

```json
{
  "archiver": "^7.0.1",        // Criação de arquivos ZIP (.twbx)
  "jszip": "^3.10.1",         // Manipulação de ZIP
  "xml2js": "^0.6.2",         // Geração de XML do Tableau
  "@types/archiver": "^6.0.3", // Tipos TypeScript
  "@types/xml2js": "^0.4.14"   // Tipos TypeScript
}
```

---

## 🎯 **Casos de Uso Recomendados**

### **Excel Export**:
- Compartilhar dados filtrados com equipes
- Backup de dados específicos
- Análises rápidas em Excel/Google Sheets
- Integrações com outros sistemas

### **Tableau Export**:
- Apresentações executivas
- Análises complexas e dashboards interativos
- Relatórios gerenciais profissionais
- Identificação de tendências e insights avançados

---

## 📝 **Notas Técnicas**

- **Limite de Dados**: Sem limite específico, mas recomendado até 100k registros para performance
- **Compatibilidade**: Tableau Desktop 2018.1+ (versão 18.1 configurada)
- **Encoding**: UTF-8 para suporte completo a acentos e caracteres especiais
- **Validação**: Dados sempre validados antes da exportação
- **Error Handling**: Tratamento de erros com mensagens informativas

As duas funcionalidades trabalham em conjunto para oferecer um fluxo completo de **importação → limpeza → análise → exportação** profissional.