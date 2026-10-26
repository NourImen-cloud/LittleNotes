import type { Note, Notebook } from '../types';

export interface SyncPayload {
  notes?: Note[];
  notebooks?: Notebook[];
  timestamp: number;
  senderId?: string;
  type?: 'SYNC_FULL' | 'SYNC_UPDATE' | 'REQUEST_SYNC';
}

export type SyncStatus = 'idle' | 'pairing' | 'connected' | 'syncing' | 'error';

const STORAGE_SYNC_ROOM_KEY = 'littlenotes_sync_room_v1';
const NTFY_RELAY_URL = 'https://ntfy.sh';

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

export function generateSyncCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = 'LN-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getChannelTopic(roomCode: string): string {
  const clean = roomCode.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return `littlenotes-v2-${clean}`;
}

/**
 * Safely extract SyncPayload from either an inline message or an attached file URL.
 * ntfy.sh automatically converts bodies >4096 bytes into attachment files.
 */
async function extractPayload(item: any): Promise<SyncPayload | null> {
  if (!item) return null;

  // 1. Check for file attachment (>4KB payloads)
  if (item.attachment && item.attachment.url) {
    try {
      const res = await fetch(item.attachment.url);
      if (res.ok) {
        const data = await res.json();
        if (data && (Array.isArray(data.notes) || Array.isArray(data.notebooks) || data.type === 'REQUEST_SYNC')) {
          return data as SyncPayload;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch sync attachment payload', e);
    }
  }

  // 2. Check for inline JSON message (≤4KB payloads)
  if (item.message && typeof item.message === 'string') {
    const trimmed = item.message.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const data = JSON.parse(trimmed);
        if (data && (Array.isArray(data.notes) || Array.isArray(data.notebooks) || data.type === 'REQUEST_SYNC')) {
          return data as SyncPayload;
        }
      } catch {}
    }
  }

  return null;
}

/**
 * Upload notes & notebooks to the zero-config instant relay.
 * No account, database, or cloud setup required by the user.
 */
export async function pushSyncData(
  roomCode: string,
  notes: Note[],
  notebooks: Notebook[],
  type: 'SYNC_FULL' | 'SYNC_UPDATE' | 'REQUEST_SYNC' = 'SYNC_UPDATE'
): Promise<boolean> {
  if (!roomCode) return false;

  const topic = getChannelTopic(roomCode);
  const payload: SyncPayload = {
    notes,
    notebooks,
    timestamp: Date.now(),
    senderId: CLIENT_ID,
    type,
  };

  try {
    const res = await fetch(`${NTFY_RELAY_URL}/${topic}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Title: 'LittleNotes Sync',
        Filename: 'littlenotes.json',
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (err) {
    console.warn('Failed to push sync data via relay', err);
    return false;
  }
}

/**
 * Send a lightweight request for the host device to transmit its full dataset.
 */
export async function requestSyncSnapshot(roomCode: string): Promise<boolean> {
  if (!roomCode) return false;

  const topic = getChannelTopic(roomCode);
  const payload: SyncPayload = {
    timestamp: Date.now(),
    senderId: CLIENT_ID,
    type: 'REQUEST_SYNC',
  };

  try {
    const res = await fetch(`${NTFY_RELAY_URL}/${topic}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Title: 'LittleNotes Sync Handshake',
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch latest notes & notebooks from the room snapshot.
 */
export async function pullSyncData(roomCode: string): Promise<SyncPayload | null> {
  if (!roomCode) return null;

  const topic = getChannelTopic(roomCode);

  try {
    const res = await fetch(`${NTFY_RELAY_URL}/${topic}/json?poll=1`);
    if (!res.ok) return null;

    const text = await res.text();
    if (!text || !text.trim()) return null;

    const lines = text.trim().split('\n');
    // Check newest messages first
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const item = JSON.parse(lines[i]);
        const payload = await extractPayload(item);
        if (payload && (Array.isArray(payload.notes) || Array.isArray(payload.notebooks))) {
          return payload;
        }
      } catch {}
    }

    return null;
  } catch (err) {
    console.warn('Failed to pull sync data via relay', err);
    return null;
  }
}

/**
 * Real-time instant stream listener using Server-Sent Events (SSE).
 * Instantly notifies the device when notes or notebooks are added or updated on the other device.
 */
export function subscribeToSyncRoom(
  roomCode: string,
  onRemoteUpdate: (payload: SyncPayload) => void
): () => void {
  if (!roomCode || typeof window === 'undefined') {
    return () => {};
  }

  const topic = getChannelTopic(roomCode);
  let eventSource: EventSource | null = null;
  let isClosed = false;

  const connect = () => {
    if (isClosed) return;

    try {
      eventSource = new EventSource(`${NTFY_RELAY_URL}/${topic}/sse`);

      eventSource.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'message') {
            const payload = await extractPayload(data);
            if (payload && payload.senderId !== CLIENT_ID) {
              onRemoteUpdate(payload);
            }
          }
        } catch (e) {
          console.warn('Error parsing incoming sync event', e);
        }
      };

      eventSource.onerror = () => {
        // EventSource will automatically attempt to reconnect
      };
    } catch (err) {
      console.warn('Failed to open sync stream', err);
    }
  };

  connect();

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}
