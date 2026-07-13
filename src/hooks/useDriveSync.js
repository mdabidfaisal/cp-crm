import { useState } from 'react';

export function useDriveSync() {
  const [syncing, setSyncing] = useState(false);

  const syncToDrive = async (key, data) => {
    setSyncing(true);
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } finally {
      setSyncing(false);
    }
  };

  return { syncing, syncToDrive };
}
