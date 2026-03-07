/**
 * Supabase API Helper
 * Centralized helper for calling Supabase Edge Functions securely
 */

import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase';
import { Logger } from './logger';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    rateLimitRemaining?: number;
}

/**
 * Call a Supabase Edge Function with authentication
 */
export async function callEdgeFunction<T>(
    functionName: string,
    body: Record<string, any>
): Promise<ApiResponse<T>> {
    if (!isSupabaseConfigured || !SUPABASE_URL) {
        return { error: 'Supabase not configured' };
    }

    try {
        const client = getSupabaseClient();
        let authHeader = '';

        if (client) {
            const { data: { session } } = await client.auth.getSession();
            if (session?.access_token) {
                authHeader = `Bearer ${session.access_token}`;
            }
        }

        const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
                'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
            },
            body: JSON.stringify(body),
        });

        const rateLimitRemaining = parseInt(
            response.headers.get('X-RateLimit-Remaining') || '-1',
            10
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (response.status === 429) {
                return {
                    error: 'Rate limit exceeded. Please try again later.',
                    rateLimitRemaining: 0,
                };
            }

            return {
                error: errorData.error || `Request failed: ${response.status}`,
                rateLimitRemaining,
            };
        }

        const data = await response.json();
        return { data, rateLimitRemaining };
    } catch (error) {
        Logger.error(`Edge function ${functionName} error:`, error);
        return { error: error instanceof Error ? error.message : 'Network error' };
    }
}
