import React, { createContext, useContext, useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterAuthContextType {
  isAuthenticated: boolean;
  fid: number | null;
  isLoading: boolean;
  authenticate: () => Promise<void>;
  logout: () => void;
}

const FarcasterAuthContext = createContext<FarcasterAuthContextType | undefined>(undefined);

export function useFarcasterAuth() {
  const context = useContext(FarcasterAuthContext);
  if (context === undefined) {
    throw new Error('useFarcasterAuth must be used within a FarcasterAuthProvider');
  }
  return context;
}

export function FarcasterAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fid, setFid] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing Farcaster authentication...');
        
        // Check if we're in a Mini App environment
        if (!sdk || !sdk.actions) {
          console.log('SDK not available, skipping Farcaster auth');
          setIsLoading(false);
          return;
        }

        // Try to get a Quick Auth token - this will automatically authenticate the user
        // if they're in a Farcaster client
        try {
          const { token } = await sdk.quickAuth.getToken();
          console.log('Quick Auth token obtained:', !!token);
          
          if (token) {
            // Decode the JWT to get the FID (subject)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userFid = payload.sub;
            
            console.log('User authenticated with FID:', userFid);
            setFid(userFid);
            setIsAuthenticated(true);
          }
        } catch (authError) {
          console.log('Quick Auth failed, user not in Farcaster client:', authError);
          // This is expected if the user is not in a Farcaster client
        }
      } catch (error) {
        console.error('Failed to initialize Farcaster authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const authenticate = async () => {
    try {
      setIsLoading(true);
      const { token } = await sdk.quickAuth.getToken();
      
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userFid = payload.sub;
        
        setFid(userFid);
        setIsAuthenticated(true);
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
    setFid(null);
  };

  const value = {
    isAuthenticated,
    fid,
    isLoading,
    authenticate,
    logout,
  };

  return (
    <FarcasterAuthContext.Provider value={value}>
      {children}
    </FarcasterAuthContext.Provider>
  );
} 