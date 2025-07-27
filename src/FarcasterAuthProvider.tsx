import React, { createContext, useContext, useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface WalletAuthContextType {
  isAuthenticated: boolean;
  address: string | null;
  isLoading: boolean;
  authenticate: () => Promise<void>;
  logout: () => void;
}

const WalletAuthContext = createContext<WalletAuthContextType | undefined>(undefined);

export function useWalletAuth() {
  const context = useContext(WalletAuthContext);
  if (context === undefined) {
    throw new Error('useWalletAuth must be used within a WalletAuthProvider');
  }
  return context;
}

export function WalletAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing wallet authentication...');
        
        // Check if we're in a Mini App environment
        if (!sdk || !sdk.actions) {
          console.log('SDK not available, skipping wallet auth');
          setIsLoading(false);
          return;
        }

        // Try to get the Ethereum provider - this will automatically connect to the user's wallet
        // in Base App where they're already signed in
        try {
          const provider = await sdk.wallet.getEthereumProvider();
          console.log('Ethereum provider obtained:', !!provider);
          
          if (provider) {
            // Get the connected accounts
            const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
            
            if (accounts && accounts.length > 0) {
              const userAddress = accounts[0];
              console.log('User authenticated with address:', userAddress);
              setAddress(userAddress);
              setIsAuthenticated(true);
            }
          }
        } catch (authError) {
          console.log('Wallet auth failed, user not in Base App:', authError);
          // This is expected if the user is not in Base App
        }
      } catch (error) {
        console.error('Failed to initialize wallet authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const authenticate = async () => {
    try {
      setIsLoading(true);
      const provider = await sdk.wallet.getEthereumProvider();
      
      if (provider) {
        const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
        
        if (accounts && accounts.length > 0) {
          const userAddress = accounts[0];
          setAddress(userAddress);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAddress(null);
  };

  const value = {
    isAuthenticated,
    address,
    isLoading,
    authenticate,
    logout,
  };

  return (
    <WalletAuthContext.Provider value={value}>
      {children}
    </WalletAuthContext.Provider>
  );
} 