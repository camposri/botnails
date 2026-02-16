-- Prevent two appointments starting at the same time for the same professional

CREATE UNIQUE INDEX IF NOT EXISTS appointments_unique_start_time
ON public.appointments (user_id, date, start_time)
WHERE status <> 'cancelled';

