-- Ensure public booking pages work for both anon and authenticated users

-- Profiles: allow lookup by booking_slug
DROP POLICY IF EXISTS "Public can view profiles by booking_slug" ON public.profiles;
CREATE POLICY "Public can view profiles by booking_slug"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (booking_slug IS NOT NULL);

-- Services: allow listing active services for booking
DROP POLICY IF EXISTS "Public can view active services for booking" ON public.services;
CREATE POLICY "Public can view active services for booking"
ON public.services
FOR SELECT
TO anon, authenticated
USING (
  is_active = true
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = services.user_id
      AND p.booking_slug IS NOT NULL
  )
);

-- Appointments: allow availability checks and booking creation
DROP POLICY IF EXISTS "Public can view appointments for availability" ON public.appointments;
CREATE POLICY "Public can view appointments for availability"
ON public.appointments
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = appointments.user_id
      AND p.booking_slug IS NOT NULL
  )
);

DROP POLICY IF EXISTS "Public can create appointments" ON public.appointments;
CREATE POLICY "Public can create appointments"
ON public.appointments
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = appointments.user_id
      AND p.booking_slug IS NOT NULL
  )
);

