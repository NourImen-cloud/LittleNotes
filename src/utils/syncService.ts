import type { Note, Notebook } from '../types';

export interface SyncPayload {
  notes: Note[];
  notebooks: Notebook[];
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
 * Upload notes & notebooks to the zero-config instant relay.
 * No account, database, or cloud setup required by the user.
 */
export async function pushSyncData(
  roomCode: string,
  notes: Note[],
  notebooks: Notebook[]
): Promise<boolean> {
  if (!roomCode) return false;

  const topic = getChannelTopic(roomCode);
  const payload: SyncPayload = {
    notes,
    notebooks,
    timestamp: Date.now(),
    senderId: CLIENT_ID,
    type: 'SYNC_UPDATE',
  };

  try {
    const res = await fetch(`${NTFY_RELAY_URL}/${topic}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Title: 'LittleNotes Sync',
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
    // Read the newest valid message
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const item = JSON.parse(lines[i]);
        if (item.message) {
          const payload = JSON.parse(item.message) as SyncPayload;
          if (Array.isArray(payload.notes)) {
            return payload;
          }
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
 * Instantly notifies the device when notes are added or updated on the other device.
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

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'message' && data.message) {
            const payload = JSON.parse(data.message) as SyncPayload;
            if (payload && payload.senderId !== CLIENT_ID && Array.isArray(payload.notes)) {
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
