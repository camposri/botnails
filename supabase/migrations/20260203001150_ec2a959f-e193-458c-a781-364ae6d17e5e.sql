-- Criar bucket para comprovantes de pagamento
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Política para usuários autenticados enviarem seus comprovantes
CREATE POLICY "Users can upload their own receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para usuários verem seus próprios comprovantes
CREATE POLICY "Users can view their own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para admins verem todos os comprovantes
CREATE POLICY "Admins can view all receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-receipts' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Adicionar coluna para URL do comprovante na tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS payment_receipt_url text;

-- Adicionar coluna para email do admin que deve receber notificações
-- Isso permite configurar qual admin recebe os emails
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notify_on_signup boolean DEFAULT false;