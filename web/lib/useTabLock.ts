'use client';
import { useEffect, useRef, useState } from 'react';

type Msg = { type: 'HELLO' | 'OCCUPIED' | 'HEARTBEAT'; tabId: string };

/**
 * Prevents the same exercise page from being open in more than one tab at a time.
 * First tab to load claims ownership; subsequent tabs see isLocked = true.
 */
export function useTabLock(key: string): { isLocked: boolean } {
  const [isLocked, setIsLocked] = useState(false);
  const tabId = useRef(`tab_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const ownerRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    const channel = new BroadcastChannel(`tab_lock_${key}`);
    let heartbeatTimer: ReturnType<typeof setInterval>;
    let claimTimer: ReturnType<typeof setTimeout>;

    channel.onmessage = (e: MessageEvent<Msg>) => {
      const msg = e.data;
      if (msg.tabId === tabId.current) return;

      if (msg.type === 'HELLO' && ownerRef.current) {
        channel.postMessage({ type: 'OCCUPIED', tabId: tabId.current } satisfies Msg);
      }

      if ((msg.type === 'OCCUPIED' || msg.type === 'HEARTBEAT') && !ownerRef.current) {
        clearTimeout(claimTimer);
        setIsLocked(true);
      }
    };

    channel.postMessage({ type: 'HELLO', tabId: tabId.current } satisfies Msg);

    // If no OCCUPIED response within 200 ms, this tab owns the page
    claimTimer = setTimeout(() => {
      if (!ownerRef.current) {
        ownerRef.current = true;
        heartbeatTimer = setInterval(() => {
          channel.postMessage({ type: 'HEARTBEAT', tabId: tabId.current } satisfies Msg);
        }, 2000);
      }
    }, 200);

    return () => {
      clearTimeout(claimTimer);
      clearInterval(heartbeatTimer);
      channel.close();
    };
  }, [key]);

  return { isLocked };
}
