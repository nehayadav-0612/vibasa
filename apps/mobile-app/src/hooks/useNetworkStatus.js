
import { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let unsubscribe;

    async function checkNetwork() {
      const state = await NetInfo.fetch();
      setIsOnline(state.isConnected && state.isInternetReachable);
    }

    checkNetwork();

    unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { isOnline };
}
