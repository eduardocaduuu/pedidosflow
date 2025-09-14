import StatusBadge from '../StatusBadge';

export default function StatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-4 p-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Pagamento</h3>
        <div className="flex gap-2">
          <StatusBadge type="payment" status="BOLETO Pago" />
          <StatusBadge type="payment" status="Parcelado Pendente" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Situação Fiscal</h3>
        <div className="flex gap-2">
          <StatusBadge type="fiscal" status="Faturado" />
          <StatusBadge type="fiscal" status="Não Faturado" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Status Comercial</h3>
        <div className="flex gap-2">
          <StatusBadge type="commercial" status="Aprovado" />
          <StatusBadge type="commercial" status="Pendente" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Entrega</h3>
        <div className="flex gap-2">
          <StatusBadge type="delivery" status="Retirar na central de serviço" />
          <StatusBadge type="delivery" status="No endereço da entrega" />
        </div>
      </div>
    </div>
  );
}