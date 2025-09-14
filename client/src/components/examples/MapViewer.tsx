import MapViewer from '../MapViewer';
import type { Order } from '@shared/schema';

export default function MapViewerExample() {
  // TODO: Remove mock functionality - replace with real data from backend
  const mockOrder: Order = {
    id: "1",
    codigoPedido: "PED001",
    situacaoFiscal: "Faturado",
    pessoa: "12345",
    nomePessoa: "João Silva Santos",
    papel: "Cliente Premium",
    qtdeItens: 15,
    valorPedido: "2450.75",
    tipoEntrega: "No endereço da entrega",
    situacaoComercial: "Aprovado",
    dataAprovacao: new Date("2024-01-15T14:30:00"),
    previsaoEntrega: new Date("2024-01-22T00:00:00"),
    cicloCaptacao: "13/2024",
    diaCiclo: 5,
    planoPagamento: "BOLETO Pago via Pix",
    logradouro: "Rua das Flores, 123",
    complemento: "Apto 45",
    bairro: "Vila Madalena",
    cidade: "São Paulo",
    uf: "SP",
    cep: "05434-000",
    referencia: "Próximo ao shopping",
    bairroEntregaRetirada: "Centro",
    cidadeEntregaRetirada: "São Paulo",
    referenciaEntregaRetirada: "Loja matriz",
    telefone: "(11) 99999-8888",
    responsavelEstrutura: "Maria Costa",
    usuarioFinalizacao: "Carlos Santos"
  };

  return (
    <div className="p-6 max-w-2xl">
      <MapViewer order={mockOrder} />
    </div>
  );
}