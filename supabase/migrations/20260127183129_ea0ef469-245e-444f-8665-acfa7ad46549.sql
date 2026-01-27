-- Add public booking slug to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS booking_slug TEXT UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_profiles_booking_slug ON public.profiles(booking_slug);

-- Allow public to view profiles by booking_slug (for booking page)
CREATE POLICY "Public can view profiles by booking_slug" 
ON public.profiles 
FOR SELECT 
TO anon
USING (booking_slug IS NOT NULL);

-- Allow public to view active services for booking
CREATE POLICY "Public can view active services for booking" 
ON public.services 
FOR SELECT 
TO anon
USING (is_active = true);

-- Allow public to view appointments for availability check
CREATE POLICY "Public can view appointments for availability" 
ON public.appointments 
FOR SELECT 
TO anon
USING (true);

-- Allow public to insert appointments (for booking)
CREATE POLICY "Public can create appointments" 
ON public.appointments 
FOR INSERT 
TO anon
WITH CHECK (true);