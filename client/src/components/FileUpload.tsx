import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Check, AlertCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileProcessed?: () => void;
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
    warnings?: string[];
    skippedRows?: number;
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
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Start progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Call the API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      let message = result.message;
      if (result.skippedRows && result.skippedRows > 0) {
        message += ` (${result.skippedRows} linhas com problemas de formato foram ignoradas)`;
      }

      setProcessResult({
        success: true,
        message: message,
        ordersCount: result.ordersProcessed,
        warnings: result.warnings,
        skippedRows: result.skippedRows
      });

      // Trigger refresh of orders list
      onFileProcessed?.();

      const successMessage = result.skippedRows > 0
        ? `${result.ordersProcessed} de ${result.totalRows} pedidos importados`
        : `${result.ordersProcessed} pedidos importados com sucesso`;

      toast({
        title: "Arquivo processado!",
        description: successMessage,
      });

      if (result.warnings && result.warnings.length > 0) {
        console.warn('Processing warnings:', result.warnings);
      }

      if (result.errors && result.errors.length > 0) {
        console.warn('Processing errors:', result.errors);
      }

    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      setProcessResult({
        success: false,
        message: errorMessage
      });

      toast({
        title: "Erro no processamento",
        description: errorMessage,
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
    <Card className="backdrop-blur-xl bg-card/60 dark:bg-card/50 border border-border/40 shadow-2xl relative overflow-hidden">
      {/* Glass reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-chart-2/5 dark:from-white/5 dark:to-chart-2/10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/40" />

      <CardContent className="p-6 relative z-10">
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
                <div className="space-y-3">
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
                          {processResult.ordersCount} pedidos carregados
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Warnings */}
                  {processResult.warnings && processResult.warnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">
                          Avisos de formatação ({processResult.warnings.length})
                        </span>
                      </div>
                      <div className="text-xs text-yellow-700 max-h-32 overflow-y-auto">
                        {processResult.warnings.slice(0, 5).map((warning, index) => (
                          <div key={index}>{warning}</div>
                        ))}
                        {processResult.warnings.length > 5 && (
                          <div className="italic">E mais {processResult.warnings.length - 5} avisos...</div>
                        )}
                      </div>
                      <p className="text-xs text-yellow-600 mt-2">
                        Algumas datas podem estar em formato incorreto, mas os pedidos foram processados normalmente.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}