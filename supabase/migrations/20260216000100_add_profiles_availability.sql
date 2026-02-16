-- Add availability configuration for professional schedules

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS availability jsonb
NOT NULL
DEFAULT '{"version":1,"step_minutes":30,"days":{"sun":{"enabled":false,"intervals":[{"start":"09:00","end":"18:00"}]},"mon":{"enabled":true,"intervals":[{"start":"09:00","end":"18:00"}]},"tue":{"enabled":true,"intervals":[{"start":"09:00","end":"18:00"}]},"wed":{"enabled":true,"intervals":[{"start":"09:00","end":"18:00"}]},"thu":{"enabled":true,"intervals":[{"start":"09:00","end":"18:00"}]},"fri":{"enabled":true,"intervals":[{"start":"09:00","end":"18:00"}]},"sat":{"enabled":false,"intervals":[{"start":"09:00","end":"18:00"}]}}}'::jsonb;

UPDATE public.profiles
SET availability = DEFAULT
WHERE availability IS NULL;

