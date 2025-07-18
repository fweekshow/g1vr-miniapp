import React, { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAccount, useConnect } from "wagmi";
import DailyCause from "./DailyCause";
import ActivityFeed from "./ActivityFeed";

function App() {
  const [activeTab, setActiveTab] = useState<'cause' | 'activity'>('cause');

  useEffect(() => {
    // Call ready() immediately when component mounts
    const handleReady = async () => {
      try {
        console.log('SDK available:', !!sdk);
        console.log('SDK actions available:', !!sdk?.actions);
        console.log('Calling sdk.actions.ready()...');
        await sdk.actions.ready();
        console.log('sdk.actions.ready() called successfully');
      } catch (error) {
        console.error('Error calling sdk.actions.ready():', error);
      }
    };
    
    // Call ready immediately
    handleReady();
  }, []);

  return (
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
  );
}

function ConnectMenu() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  if (isConnected) {
    return (
      <div className="bg-black shadow-sm border-b border-terminal p-3 flex-shrink-0">
        <div className="text-xs text-terminal font-mono">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black shadow-sm border-b border-terminal p-3 flex-shrink-0">
      <button 
        type="button" 
        onClick={() => connect({ connector: connectors[0] })}
        className="w-full bg-terminal text-black px-4 py-3 rounded font-bold hover:bg-terminal/80 font-mono tracking-widest text-sm"
      >
        CONNECT WALLET
      </button>
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
