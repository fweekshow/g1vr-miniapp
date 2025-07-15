import React from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import DailyCause from "./DailyCause";
import TokenClaims from "./TokenClaims";
import ActivityFeed from "./ActivityFeed";

function App() {
  const [activeTab, setActiveTab] = useState<'cause' | 'claims' | 'activity'>('cause');

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <div className="min-h-screen bg-terminal-bg">
      <div className="max-w-md mx-auto">
        <ConnectMenu />
        
        {activeTab === 'cause' && <DailyCause />}
        {activeTab === 'claims' && <TokenClaims />}
        {activeTab === 'activity' && <ActivityFeed />}
        
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}

function ConnectMenu() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  if (isConnected) {
    return (
      <div className="bg-black shadow-sm border-b border-terminal p-3">
        <div className="text-sm text-terminal font-mono">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black shadow-sm border-b border-terminal p-4">
      <button 
        type="button" 
        onClick={() => connect({ connector: connectors[0] })}
        className="w-full bg-terminal text-black px-4 py-2 rounded font-bold hover:bg-terminal/80 font-mono tracking-widest"
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
  activeTab: 'cause' | 'claims' | 'activity';
  setActiveTab: (tab: 'cause' | 'claims' | 'activity') => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-terminal">
      <div className="max-w-md mx-auto flex">
        <button
          onClick={() => setActiveTab('cause')}
          className={`flex-1 py-3 px-2 text-sm font-bold font-mono ${
            activeTab === 'cause' 
              ? 'text-terminal border-t-2 border-terminal' 
              : 'text-gray-400'
          }`}
        >
          DAILY CAUSE
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`flex-1 py-3 px-2 text-sm font-bold font-mono ${
            activeTab === 'claims' 
              ? 'text-terminal border-t-2 border-terminal' 
              : 'text-gray-400'
          }`}
        >
          CLAIMS
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-3 px-2 text-sm font-bold font-mono ${
            activeTab === 'activity' 
              ? 'text-terminal border-t-2 border-terminal' 
              : 'text-gray-400'
          }`}
        >
          ACTIVITY
        </button>
      </div>
    </div>
  );
}

export default App;
