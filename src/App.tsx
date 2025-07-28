import React, { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import DailyCause from "./DailyCause";
import ActivityFeed from "./ActivityFeed";
import RewardsDisplay from "./RewardsDisplay";
import { BaseAccountProvider, useBaseAccount } from "./BaseAccountProvider";
import { WalletAuthProvider, useWalletAuth } from "./WalletAuthProvider";
import { MiniKitContextProvider } from "./MiniKitProvider";

function AppContent({ 
  activeTab, 
  setActiveTab 
}: { 
  activeTab: 'cause' | 'activity' | 'rewards';
  setActiveTab: (tab: 'cause' | 'activity' | 'rewards') => void;
}) {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    // Set frame ready for MiniKit when app is loaded
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <WalletAuthProvider>
      <BaseAccountProvider>
        <div className="min-h-full bg-terminal-bg flex flex-col">
          <div className="w-full max-w-sm mx-auto flex flex-col flex-1">
            <ConnectMenu />
            
            <div className="flex-1 overflow-y-auto flex flex-col justify-center items-center px-4 pb-6">
              {activeTab === 'cause' && <DailyCause />}
              {activeTab === 'activity' && <ActivityFeed />}
              {activeTab === 'rewards' && <RewardsDisplay />}
              
              <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          </div>
        </div>
      </BaseAccountProvider>
    </WalletAuthProvider>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<'cause' | 'activity' | 'rewards'>('cause');

  useEffect(() => {
    // Check if we're in a Mini App environment
    const checkMiniAppEnvironment = async () => {
      try {
        console.log('Checking Mini App environment...');
        console.log('SDK available:', !!sdk);
        console.log('SDK actions available:', !!sdk?.actions);
        
        // Check if SDK is available
        if (!sdk || !sdk.actions) {
          console.log('SDK not available, redirecting to g1ve.xyz');
          window.location.href = 'https://g1ve.xyz';
          return;
        }
        
        // Try to call sdk.actions.ready() - this will only work in Mini App environment
        await sdk.actions.ready();
        console.log('Mini App environment detected - continuing normally');
        
        // Mini App environment detected - continue normally
      } catch (error) {
        console.log('Browser environment detected, redirecting to g1ve.xyz');
        console.log('Error details:', error);
        // If this fails, we're likely in a browser environment
        window.location.href = 'https://g1ve.xyz';
      }
    };
    
    checkMiniAppEnvironment();
  }, []);

  return (
    <MiniKitContextProvider>
      <AppContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </MiniKitContextProvider>
  );
}

function ConnectMenu() {
  const { address: baseAddress, isConnected: baseConnected, connect, isLoading } = useBaseAccount();
  const { isAuthenticated, address: walletAddress, isLoading: authLoading } = useWalletAuth();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  // If user is authenticated with wallet in Base App, show simple connected status
  if (isAuthenticated && walletAddress) {
    return (
      <div className="bg-black shadow-sm border-b border-terminal p-3 flex-shrink-0">
        <div className="flex justify-center items-center">
          <div className="text-xs text-terminal font-mono">
            CONNECTED
          </div>
        </div>
      </div>
    );
  }

  // If user has connected their Base wallet manually, show simple connected status
  if (baseConnected && baseAddress) {
    return (
      <div className="bg-black shadow-sm border-b border-terminal p-3 flex-shrink-0">
        <div className="flex justify-center items-center">
          <div className="text-xs text-terminal font-mono">
            CONNECTED
          </div>
        </div>
      </div>
    );
  }

  // Show connect button only if not authenticated with wallet and not loading
  if (!authLoading) {
    return (
      <div className="bg-black shadow-sm border-b border-terminal p-3 flex-shrink-0">
        <button 
          onClick={handleConnect}
          disabled={isLoading}
          className="bg-terminal text-black px-6 py-2 rounded font-bold hover:bg-terminal/80 font-mono tracking-widest text-xs disabled:opacity-50"
        >
          {isLoading ? 'CONNECTING...' : 'CONNECT'}
        </button>
      </div>
    );
  }

  // Show loading state
  return (
    <div className="bg-black shadow-sm border-b border-terminal p-3 flex-shrink-0">
      <div className="text-xs text-gray-400 font-mono text-center">
        CONNECTING...
      </div>
    </div>
  );
}

function TabNavigation({ 
  activeTab, 
  setActiveTab 
}: { 
  activeTab: 'cause' | 'activity' | 'rewards';
  setActiveTab: (tab: 'cause' | 'activity' | 'rewards') => void;
}) {
      return (
      <div className="w-full max-w-sm mx-auto mt-6">
        <div className="bg-black border border-terminal rounded-lg p-1 flex">
          <button
            onClick={() => setActiveTab('cause')}
            className={`flex-1 py-3 px-4 text-xs font-bold font-mono rounded-md transition-colors ${
              activeTab === 'cause' 
                ? 'bg-terminal text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            DAILY CAUSE
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-3 px-4 text-xs font-bold font-mono rounded-md transition-colors ${
              activeTab === 'activity' 
                ? 'bg-terminal text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ACTIVITY
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-3 px-4 text-xs font-bold font-mono rounded-md transition-colors ${
              activeTab === 'rewards' 
                ? 'bg-terminal text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            REWARDS
          </button>

        </div>
      </div>
    );
}

export default App;
