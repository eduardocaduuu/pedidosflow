# PedidosFlow - Sistema de Gestão de Pedidos

Um sistema moderno e elegante para gerenciamento de pedidos através de importação de planilhas Excel.

## 🚀 Características

- **Upload de Excel**: Importa planilhas .xlsx/.xls com processamento automático
- **Interface Moderna**: Design glass morphism com tema escuro/claro
- **Visualização de Dados**: Cards interativos com informações completas
- **Filtros Avançados**: Pesquisa e filtros por status, tipo de entrega
- **Integração com Mapas**: Visualização de endereços no Google Maps
- **Responsivo**: Funciona perfeitamente em desktop e mobile

## 🛠 Tecnologias

- **Frontend**: React, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, TypeScript
- **Processamento**: XLSX para parsing de Excel
- **Upload**: Multer para upload de arquivos
- **Build**: Vite + esbuild

## 📋 Deploy no Render

Este projeto está configurado para deploy gratuito no Render.com:

1. Fork este repositório
2. Conecte sua conta GitHub ao Render
3. Crie um novo Web Service:
   - Repository: seu fork
   - Branch: main
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: Node
   - Plan: Free

A configuração `render.yaml` já está incluída.

## 💾 Dados

Os dados são armazenados em memória durante a execução. Para persistência, considere:
- Render PostgreSQL (plano pago)
- Firebase Firestore
- Supabase (plano gratuito)

## 📊 Formato do Excel

A planilha deve conter as seguintes colunas:
- Código do Pedido
- Situação Fiscal
- Nome da Pessoa
- Valor do Pedido
- Tipo de Entrega
- Situação Comercial
- Logradouro, Cidade, UF, CEP
- Telefone
- E outras informações do pedido

## 🔧 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start
```

## 📝 Licença

MIT License