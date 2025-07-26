import React, { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import DailyCause from "./DailyCause";
import ActivityFeed from "./ActivityFeed";
import { BaseAccountProvider, useBaseAccount } from "./BaseAccountProvider";
import { FarcasterAuthProvider, useFarcasterAuth } from "./FarcasterAuthProvider";

function App() {
  const [activeTab, setActiveTab] = useState<'cause' | 'activity'>('cause');

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
    <FarcasterAuthProvider>
      <BaseAccountProvider>
        <div className="min-h-full bg-terminal-bg flex flex-col">
          <div className="w-full max-w-sm mx-auto flex flex-col flex-1">
            <ConnectMenu />
            
            <div className="flex-1 overflow-y-auto flex flex-col justify-center items-center px-4 pb-6">
              {activeTab === 'cause' && <DailyCause />}
              {activeTab === 'activity' && <ActivityFeed />}
              
              <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          </div>
        </div>
      </BaseAccountProvider>
    </FarcasterAuthProvider>
  );
}

function ConnectMenu() {
  const { address, isConnected, connect, isLoading } = useBaseAccount();
  const { isAuthenticated, fid, isLoading: authLoading } = useFarcasterAuth();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  // If user is authenticated with Farcaster, show their FID instead of wallet connection
  if (isAuthenticated && fid) {
    return (
      <div className="bg-black shadow-sm border-b border-terminal p-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="text-xs text-terminal font-mono">
            Farcaster: {fid}
          </div>
          <div className="text-xs text-gray-400 font-mono">
            AUTO-CONNECTED
          </div>
        </div>
      </div>
    );
  }

  // If user has connected their Base wallet, show the wallet info
  if (isConnected && address) {
    return (
      <div className="bg-black shadow-sm border-b border-terminal p-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="text-xs text-terminal font-mono">
            Connected: {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        </div>
      </div>
    );
  }

  // Show connect button only if not authenticated with Farcaster and not loading
  if (!authLoading) {
    return (
      <div className="bg-black shadow-sm border-b border-terminal p-3 flex-shrink-0">
        <button 
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full bg-terminal text-black px-4 py-3 rounded font-bold hover:bg-terminal/80 font-mono tracking-widest text-sm disabled:opacity-50"
        >
          {isLoading ? 'CONNECTING...' : 'CONNECT BASE ACCOUNT'}
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
  activeTab: 'cause' | 'activity';
  setActiveTab: (tab: 'cause' | 'activity') => void;
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
      </div>
    </div>
  );
}

export default App;
