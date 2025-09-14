import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileProcessed?: (orders: any[]) => void;
}

export default function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processResult, setProcessResult] = useState<{
    success: boolean;
    message: string;
    ordersCount?: number;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileSelection(files);
  };

  const handleFileSelection = async (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setProcessResult(null);
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate file processing with progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setProgress(100);

      // TODO: Remove mock functionality - replace with actual Excel parsing
      // Mock successful processing
      const mockOrders = [
        {
          codigoPedido: "PED001",
          nomePessoa: "João Silva",
          valorPedido: "1250.00",
          situacaoFiscal: "Faturado"
        },
        {
          codigoPedido: "PED002", 
          nomePessoa: "Maria Santos",
          valorPedido: "890.50",
          situacaoFiscal: "Não Faturado"
        }
      ];

      setProcessResult({
        success: true,
        message: "Arquivo processado com sucesso!",
        ordersCount: mockOrders.length
      });

      onFileProcessed?.(mockOrders);

      toast({
        title: "Sucesso!",
        description: `${mockOrders.length} pedidos importados com sucesso.`,
      });

    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setProcessResult({
        success: false,
        message: "Erro ao processar o arquivo. Verifique o formato e tente novamente."
      });

      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar o arquivo Excel.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setProcessResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Importar Planilha de Pedidos</h3>
            <p className="text-sm text-muted-foreground">
              Faça upload de um arquivo Excel (.xlsx ou .xls) contendo os dados dos pedidos.
            </p>
          </div>

          {!uploadedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer hover-elevate ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-card/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              data-testid="drop-zone-upload"
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-medium mb-2">
                {isDragging ? 'Solte o arquivo aqui' : 'Arraste e solte ou clique para selecionar'}
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Suporta arquivos Excel (.xlsx, .xls)
              </p>
              <Button variant="outline" data-testid="button-select-file">
                Selecionar Arquivo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
                data-testid="input-file-hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-center gap-3 p-4 bg-card/50 rounded-lg backdrop-blur-sm">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium" data-testid="text-filename">{uploadedFile.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={resetUpload} data-testid="button-remove-file">
                  Remover
                </Button>
              </div>

              {/* Processing Progress */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processando arquivo...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" data-testid="progress-processing" />
                </div>
              )}

              {/* Result */}
              {processResult && (
                <div className={`flex items-center gap-3 p-4 rounded-lg ${
                  processResult.success 
                    ? 'bg-chart-1/10 border border-chart-1/20' 
                    : 'bg-destructive/10 border border-destructive/20'
                }`}>
                  {processResult.success ? (
                    <Check className="h-5 w-5 text-chart-1" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium" data-testid="text-process-result">
                      {processResult.message}
                    </p>
                    {processResult.ordersCount && (
                      <p className="text-sm text-muted-foreground">
                        {processResult.ordersCount} pedidos encontrados
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}