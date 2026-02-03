-- Add timestamp for when the payment receipt was uploaded
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS payment_receipt_sent_at timestamp with time zone;