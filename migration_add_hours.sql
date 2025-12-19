-- Add opening_hours column to businesses table
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS opening_hours JSONB DEFAULT '{
  "monday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "tuesday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "wednesday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "thursday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "friday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "saturday": {"open": "10:00", "close": "14:00", "isOpen": true},
  "sunday": {"open": "00:00", "close": "00:00", "isOpen": false}
}'::jsonb;

-- Comment on column
COMMENT ON COLUMN public.businesses.opening_hours IS 'Stores weekly opening hours in JSON format';
