-- Adicionar campos para controle de trial e premium
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Atualizar a função handle_new_user para definir trial_ends_at
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, trial_ends_at, is_premium)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    now() + interval '30 days',
    false
  );
  RETURN NEW;
END;
$function$;