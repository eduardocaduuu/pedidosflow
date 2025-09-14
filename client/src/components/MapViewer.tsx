import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Home, Store, Phone, ExternalLink } from "lucide-react";
import type { Order } from "@shared/schema";

interface MapViewerProps {
  order: Order;
}

export default function MapViewer({ order }: MapViewerProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Mock coordinates for demo
  const mockCoordinates = {
    lat: -23.5505,
    lng: -46.6333,
    address: `${order.logradouro || ''}, ${order.bairro || ''}, ${order.cidade || ''} - ${order.uf || ''}`
  };

  const isStorePickup = order.tipoEntrega?.includes("Retirar na central");

  const handleOpenMaps = () => {
    // TODO: Remove mock functionality - integrate with real Google Maps
    const address = encodeURIComponent(mockCoordinates.address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(mapsUrl, '_blank');
    console.log('Opening Google Maps for address:', mockCoordinates.address);
  };

  const handleGetDirections = () => {
    // TODO: Remove mock functionality - integrate with real Google Maps directions
    const address = encodeURIComponent(mockCoordinates.address);
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
    window.open(directionsUrl, '_blank');
    console.log('Getting directions to:', mockCoordinates.address);
  };

  return (
    <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isStorePickup ? <Store className="h-5 w-5" /> : <Home className="h-5 w-5" />}
          {isStorePickup ? "Local de Retirada" : "Endereço de Entrega"}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Address Information */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <div className="font-medium" data-testid={`text-address-${order.codigoPedido}`}>
                {order.logradouro && `${order.logradouro}, `}
                {order.complemento && `${order.complemento}, `}
                {order.bairro}
              </div>
              <div className="text-sm text-muted-foreground">
                {order.cidade} - {order.uf}
              </div>
              <div className="text-sm text-muted-foreground">
                CEP: {order.cep}
              </div>
            </div>
            <Badge variant={isStorePickup ? "secondary" : "default"} className="shrink-0">
              {isStorePickup ? "Retirada" : "Entrega"}
            </Badge>
          </div>

          {order.referencia && (
            <div className="pl-8 text-sm text-muted-foreground">
              <strong>Referência:</strong> {order.referencia}
            </div>
          )}

          {order.telefone && (
            <div className="flex items-center gap-2 pl-8">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm" data-testid={`text-phone-${order.codigoPedido}`}>
                {order.telefone}
              </span>
            </div>
          )}
        </div>

        {/* Delivery/Pickup Location (if different) */}
        {(order.bairroEntregaRetirada || order.cidadeEntregaRetirada) && (
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-chart-2" />
              <span className="text-sm font-medium">
                Local específico de {isStorePickup ? "retirada" : "entrega"}
              </span>
            </div>
            <div className="pl-6 space-y-1">
              <div className="text-sm">
                {order.bairroEntregaRetirada}, {order.cidadeEntregaRetirada}
              </div>
              {order.referenciaEntregaRetirada && (
                <div className="text-sm text-muted-foreground">
                  <strong>Referência:</strong> {order.referenciaEntregaRetirada}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mock Map Container */}
        <div className="relative h-48 bg-gradient-to-br from-chart-3/20 to-chart-1/20 rounded-lg border border-border/50 overflow-hidden">
          {!isMapLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm">
              <div className="text-center space-y-3">
                <MapPin className="h-12 w-12 mx-auto text-primary" />
                <div>
                  <p className="font-medium">Mapa Interativo</p>
                  <p className="text-sm text-muted-foreground">
                    Localização: {order.cidade} - {order.uf}
                  </p>
                  {/* TODO: Remove mock functionality - replace with real Google Maps */}
                  <p className="text-xs text-muted-foreground mt-1">
                    (Mock - Integração com Google Maps será implementada)
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsMapLoaded(true)}
                  data-testid={`button-load-map-${order.codigoPedido}`}
                >
                  Carregar Mapa
                </Button>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-chart-3/30 to-chart-1/30 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-4 h-4 bg-red-500 rounded-full mx-auto animate-pulse" />
                <p className="text-sm font-medium">📍 {order.cidade}</p>
                <p className="text-xs text-muted-foreground">Mapa carregado</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenMaps}
            className="flex items-center gap-2 flex-1"
            data-testid={`button-open-maps-${order.codigoPedido}`}
          >
            <ExternalLink className="h-4 w-4" />
            Abrir no Maps
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleGetDirections}
            className="flex items-center gap-2 flex-1"
            data-testid={`button-directions-${order.codigoPedido}`}
          >
            <Navigation className="h-4 w-4" />
            Como Chegar
          </Button>
        </div>

        {/* Distance Info (Mock) */}
        <div className="bg-card/30 rounded-lg p-3 backdrop-blur-sm text-center">
          <div className="text-sm text-muted-foreground">
            {/* TODO: Remove mock functionality - calculate real distance */}
            <span>Distância estimada: </span>
            <span className="font-medium text-foreground">12.5 km</span>
            <span> • Tempo: </span>
            <span className="font-medium text-foreground">25 min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}