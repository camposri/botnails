import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Upload, FileImage, FileText, Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentReceiptUploadProps {
  userId: string;
  currentReceiptUrl?: string | null;
  onUploadSuccess?: (url: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export const PaymentReceiptUpload = ({
  userId,
  currentReceiptUrl,
  onUploadSuccess,
}: PaymentReceiptUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentReceiptUrl || null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type === "application/pdf") {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <FileImage className="w-8 h-8 text-blue-500" />;
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Formato não suportado. Use JPG, PNG, WEBP ou PDF.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Arquivo muito grande. Tamanho máximo: 5MB";
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast({
        title: "Erro no arquivo",
        description: error,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/comprovante-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("payment-receipts")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("payment-receipts")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Update profile with receipt URL and timestamp
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          payment_receipt_url: publicUrl,
          payment_receipt_sent_at: new Date().toISOString()
        })
        .eq("user_id", userId);

      if (updateError) {
        throw updateError;
      }

      setUploadedUrl(publicUrl);
      onUploadSuccess?.(publicUrl);

      toast({
        title: "Comprovante enviado! ✅",
        description: "Seu comprovante foi enviado com sucesso. Aguarde a aprovação.",
      });
    } catch (error) {
      const err = error as { message?: unknown };
      console.error("Upload error:", error);
      toast({
        title: "Erro ao enviar",
        description: String(err?.message || "Ocorreu um erro ao enviar o comprovante"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleRemove = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ payment_receipt_url: null })
        .eq("user_id", userId);

      if (error) throw error;

      setUploadedUrl(null);
      toast({
        title: "Comprovante removido",
        description: "Você pode enviar um novo comprovante.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o comprovante",
        variant: "destructive",
      });
    }
  };

  if (uploadedUrl) {
    return (
      <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">Comprovante enviado!</p>
            <p className="text-sm text-muted-foreground">
              Aguardando análise do administrador
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed transition-colors",
        dragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50",
        uploading && "pointer-events-none opacity-60"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
      />

      <div className="p-6 text-center">
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Enviando comprovante...</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="font-medium text-foreground mb-1">
              Arraste ou clique para enviar
            </p>
            <p className="text-sm text-muted-foreground">
              JPG, PNG, WEBP ou PDF (máx. 5MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
};
