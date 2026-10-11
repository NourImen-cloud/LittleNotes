import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Note, Notebook } from '../types';

export interface SyncPayload {
  notes: Note[];
  notebooks: Notebook[];
  timestamp: number;
  senderId?: string;
}

export type SyncStatus = 'idle' | 'pairing' | 'connected' | 'syncing' | 'error' | 'unconfigured';

const STORAGE_SYNC_ROOM_KEY = 'littlenotes_sync_room_v1';
const STORAGE_SUPABASE_URL_KEY = 'littlenotes_supabase_url_v1';
const STORAGE_SUPABASE_ANON_KEY = 'littlenotes_supabase_anon_v1';

// Generate a random client instance ID to prevent echo loops
export const CLIENT_ID = 'client-' + Math.random().toString(36).slice(2, 9);

export function getStoredRoomCode(): string | null {
  try {
    return localStorage.getItem(STORAGE_SYNC_ROOM_KEY);
  } catch {
    return null;
  }
}

export function saveStoredRoomCode(code: string | null) {
  try {
    if (code) {
      localStorage.setItem(STORAGE_SYNC_ROOM_KEY, code.toUpperCase());
    } else {
      localStorage.removeItem(STORAGE_SYNC_ROOM_KEY);
    }
  } catch (err) {
    console.error('Failed to save sync room code', err);
  }
}

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  try {
    const localUrl = localStorage.getItem(STORAGE_SUPABASE_URL_KEY) || '';
    const localKey = localStorage.getItem(STORAGE_SUPABASE_ANON_KEY) || '';
    return {
      url: localUrl || envUrl,
      anonKey: localKey || envKey,
    };
  } catch {
    return { url: envUrl, anonKey: envKey };
  }
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  try {
    localStorage.setItem(STORAGE_SUPABASE_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_SUPABASE_ANON_KEY, anonKey.trim());
  } catch (err) {
    console.error('Failed to save Supabase config', err);
  }
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  const currentKey = `${config.url}::${config.anonKey}`;
  if (cachedClient && cachedConfigKey === currentKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey);
    cachedConfigKey = currentKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client', err);
    return null;
  }
}

export function generateSyncCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = 'LN-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Upload notes & notebooks to the cloud room
 */
export async function pushSyncData(
  roomCode: string,
  notes: Note[],
  notebooks: Notebook[]
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  const payload: SyncPayload = {
    notes,
    notebooks,
    timestamp: Date.now(),
    senderId: CLIENT_ID,
  };

  try {
    const { error } = await client
      .from('sync_rooms')
      .upsert({
        id: roomCode.toUpperCase(),
        data: payload,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Sync push error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to push sync data', err);
    return false;
  }
}

/**
 * Fetch latest notes & notebooks from cloud room
 */
export async function pullSyncData(roomCode: string): Promise<SyncPayload | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('sync_rooms')
      .select('data, updated_at')
      .eq('id', roomCode.toUpperCase())
      .single();

    if (error || !data) {
      return null;
    }

    return data.data as SyncPayload;
  } catch (err) {
    console.error('Failed to pull sync data', err);
    return null;
  }
}

/**
 * Real-time channel listener for instant synchronization across devices
 */
export function subscribeToSyncRoom(
  roomCode: string,
  onRemoteUpdate: (payload: SyncPayload) => void
): () => void {
  const client = getSupabaseClient();
  if (!client) {
    return () => {};
  }

  const channel = client
    .channel(`room-${roomCode.toUpperCase()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sync_rooms',
        filter: `id=eq.${roomCode.toUpperCase()}`,
      },
      (payload) => {
        const newData = (payload.new as any)?.data as SyncPayload;
        if (newData && newData.senderId !== CLIENT_ID) {
          onRemoteUpdate(newData);
        }
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
