import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import ReactGA from 'react-ga4';

export type EventType = 'page_view' | 'click_call' | 'click_gps' | 'click_share' | 'business_view' | 'search' | 'visit';

// Initialize GA4 only once
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (GA_ID && GA_ID !== 'G-XXXXXXXXXX') {
    ReactGA.initialize(GA_ID);
}

export const useAnalytics = () => {

    // Helper to get or create a session ID stored in sessionStorage
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

            // 1. Send to Supabase (our internal DB)
            (supabase.from('analytics_events') as any).insert({
                user_id: userId || (await supabase.auth.getUser()).data.user?.id || null,
                session_id: sessionId,
                event_type: eventType,
                metadata: metadata
            }).then(({ error }: any) => {
                if (error) console.error("Internal Analytics Error:", error);
            });

            // 2. Send to Google Analytics 4
            if (GA_ID) {
                if (eventType === 'page_view') {
                    ReactGA.send({ hitType: "pageview", page: metadata.page || window.location.pathname });
                } else {
                    ReactGA.event({
                        category: "Interaction",
                        action: eventType,
                        label: metadata.business_name || metadata.category || "General",
                        value: metadata.business_id ? 1 : 0,
                        ...metadata
                    });
                }
            }

        } catch (err) {
            // Fail silently to never impact user experience
            console.error("Analytics Exception:", err);
        }
    }, []);

    return { logEvent };
};
