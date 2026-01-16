import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type EventType = 'page_view' | 'click_call' | 'click_gps' | 'click_share' | 'business_view' | 'search' | 'visit';

export const useAnalytics = () => {

    // Helper to get or create a session ID stored in sessionStorage
    // This allows tracking a "session" even if the user is not logged in
    const getSessionId = () => {
        let sid = sessionStorage.getItem('analytics_session_id');
        if (!sid) {
            sid = crypto.randomUUID();
            sessionStorage.setItem('analytics_session_id', sid);
        }
        return sid;
    };

    const logEvent = useCallback(async (
        eventType: EventType,
        metadata: Record<string, any> = {},
        userId?: string
    ) => {
        try {
            const sessionId = getSessionId();

            // Fire and forget - we don't await this in the UI thread
            // The supabase client handles the network request asynchronously
            supabase.from('analytics_events').insert({
                user_id: userId || (await supabase.auth.getUser()).data.user?.id || null,
                session_id: sessionId,
                event_type: eventType,
                metadata: metadata
            }).then(({ error }) => {
                if (error) console.error("Analytics Error:", error);
            });

        } catch (err) {
            // Fail silently to never impact user experience
            console.error("Analytics Exception:", err);
        }
    }, []);

    return { logEvent };
};
