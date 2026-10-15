import { useEffect, useRef } from 'react';

/** Runs `fn` immediately and then every `ms` while `enabled` - used for live order tracking. */
export function usePolling(fn, ms, enabled = true, deps = []) {
  const saved = useRef(fn);
  useEffect(() => {
    saved.current = fn;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    let stopped = false;
    const run = async () => {
      if (!stopped) await saved.current();
    };
    run();
    const id = setInterval(run, ms);
    return () => {
      stopped = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms, enabled, ...deps]);
}

// ---- tiny localStorage helpers for the order history (the backend has no "list my orders" endpoint yet) ----
const historyKey = (username) => `fd_orders_${username || 'guest'}`;
const snapshotKey = (orderId) => `fd_order_snapshot_${orderId}`;

export function getOrderHistory(username) {
  try {
    return JSON.parse(localStorage.getItem(historyKey(username)) || '[]');
  } catch {
    return [];
  }
}

export function rememberOrder(username, orderId, snapshot) {
  const ids = getOrderHistory(username).filter((id) => id !== orderId);
  ids.unshift(orderId);
  localStorage.setItem(historyKey(username), JSON.stringify(ids.slice(0, 30)));
  try {
    localStorage.setItem(snapshotKey(orderId), JSON.stringify(snapshot));
  } catch {
    /* storage full - the snapshot is a nice-to-have */
  }
}

export function getOrderSnapshot(orderId) {
  try {
    return JSON.parse(localStorage.getItem(snapshotKey(orderId)) || 'null');
  } catch {
    return null;
  }
}
