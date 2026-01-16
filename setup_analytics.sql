-- Analytics Events Table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id uuid NOT NULL, -- Client-side generated ID for anonymous tracking
    event_type text NOT NULL, -- 'page_view', 'click_call', 'business_view', 'search'
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- Index for faster querying by time and type
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_business_id ON public.analytics_events((metadata->>'business_id'));

-- RLS Policies
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow ANYONE (auth or anon) to insert events
CREATE POLICY "Anyone can insert analytics" 
ON public.analytics_events 
FOR INSERT 
TO public, anon 
WITH CHECK (true);

-- Allow ONLY ADMINS to select/view analytics
CREATE POLICY "Admins can view analytics" 
ON public.analytics_events 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- RPC for efficient analytics dashboard queries to avoid fetching raw rows
create or replace function get_analytics_summary(time_range text default '24h')
returns json
language plpgsql
security definer
as $$
declare
    start_time timestamptz;
    result json;
begin
    -- Determine time range
    if time_range = '24h' then
        start_time := now() - interval '24 hours';
    elsif time_range = '7d' then
        start_time := now() - interval '7 days';
    elsif time_range = '30d' then
        start_time := now() - interval '30 days';
    else
        start_time := now() - interval '24 hours';
    end if;

    select json_build_object(
        'total_views', (select count(*) from analytics_events where event_type = 'page_view' and created_at > start_time),
        'total_searches', (select count(*) from analytics_events where event_type = 'search' and created_at > start_time),
        'business_interactions', (select count(*) from analytics_events where event_type in ('click_call', 'click_gps', 'click_share') and created_at > start_time),
        'top_businesses', (
            select json_agg(t) from (
                select metadata->>'business_name' as name, count(*) as views
                from analytics_events 
                where event_type = 'business_view' 
                and created_at > start_time 
                and metadata->>'business_name' is not null
                group by metadata->>'business_name'
                order by views desc
                limit 5
            ) t
        )
    ) into result;

    return result;
end;
$$;
