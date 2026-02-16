-- Store client's phone in appointments created from public booking

ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS client_phone text;

