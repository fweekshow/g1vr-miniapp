import React, { createContext, useContext, useEffect, useState } from 'react';
import { createBaseAccountSDK } from '@base-org/account';

interface BaseAccountContextType {
  sdk: any;
  isConnected: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isLoading: boolean;
}

const BaseAccountContext = createContext<BaseAccountContextType | undefined>(undefined);

export function useBaseAccount() {
  const context = useContext(BaseAccountContext);
  if (context === undefined) {
    throw new Error('useBaseAccount must be used within a BaseAccountProvider');
  }
  return context;
}

export function BaseAccountProvider({ children }: { children: React.ReactNode }) {
  const [sdk, setSdk] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const baseSDK = createBaseAccountSDK({
          appName: 'G1VR Mini App',
        });
        
        setSdk(baseSDK);
        
        // Check if user is already connected
        const provider = await baseSDK.getProvider();
        const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
        if (accounts.length > 0) {
          setIsConnected(true);
          setAddress(accounts[0]);
        }
      } catch (error) {
        console.error('Failed to initialize Base Account SDK:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSDK();
  }, []);

  const connect = async () => {
    if (!sdk) return;
    
    try {
      setIsLoading(true);
      const provider = await sdk.getProvider();
      await provider.request({ method: 'wallet_connect' });
      const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
      if (accounts.length > 0) {
        setIsConnected(true);
        setAddress(accounts[0]);
      }
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    if (!sdk) return;
    
    try {
      const provider = await sdk.getProvider();
      if (provider.disconnect) {
        await provider.disconnect();
      }
      setIsConnected(false);
      setAddress(null);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const value = {
    sdk,
    isConnected,
    address,
    connect,
    disconnect,
    isLoading,
  };

  return (
    <BaseAccountContext.Provider value={value}>
      {children}
    </BaseAccountContext.Provider>
  );
} 