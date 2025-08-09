import React, { useEffect, useState } from 'react';
import { useOpenUrl, useNotification } from '@coinbase/onchainkit/minikit';
import { causes } from './causes';

interface Cause {
  date: string;
  name: string;
  description: string;
  external_link: string;
}

export default function DailyCause() {
  const [cause, setCause] = useState<Cause | null>(null);
  const [nextChange, setNextChange] = useState<string>('');
  const openUrl = useOpenUrl();
  const sendNotification = useNotification();

  useEffect(() => {
    // Get current date in Pacific Time at midnight
    const getPacificDate = () => {
      const now = new Date();
      const pacificTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
      const year = pacificTime.getFullYear();
      const month = String(pacificTime.getMonth() + 1).padStart(2, '0');
      const day = String(pacificTime.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const today = getPacificDate();
    console.log('Current Pacific date:', today);
    const match = causes.find(c => c.date === today);
    setCause(match || null);
    
    // Calculate next change time (midnight Pacific)
    const getNextChangeTime = () => {
      const now = new Date();
      const pacificTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
      const tomorrow = new Date(pacificTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const nextChangeTime = new Date(tomorrow.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
      return nextChangeTime.toLocaleString("en-US", { 
        timeZone: "America/Los_Angeles",
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    };
    
    setNextChange(getNextChangeTime());
  }, []);

  const handleDonate = async () => {
    if (cause?.external_link) {
      try {
        // Open donation page within Mini App context
        await openUrl(cause.external_link);
        
        // Send a notification to encourage donation completion
        sendNotification({
          title: `Support ${cause.name}`,
          body: `Thank you for considering a donation to ${cause.name}. Complete your donation to earn rewards!`
        });
      } catch (error) {
        console.error('Error opening donation page:', error);
        // Fallback to opening in new tab if MiniKit fails
        window.open(cause.external_link, '_blank');
      }
    }
  };

  if (!cause) {
    return (
      <div className="text-center p-4">
        <h2 className="text-lg font-bold mb-2 text-terminal font-mono">CAUSE COMING SOON</h2>
        <p className="text-gray-400 font-mono text-sm">Please check back later for today's featured cause.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-sm font-semibold text-terminal tracking-wide font-mono">
          DAILY REVOLVING NON-PROFIT
        </h2>
      </div>
      
      <div className="card-layout-compact">
        <h1 className="text-lg font-bold text-terminal mb-3 text-center font-mono tracking-wide">
          {cause.name}
        </h1>
        
        <p className="text-xs text-gray-200 mb-4 leading-relaxed font-mono">
          {cause.description}
        </p>

        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="bg-white p-2 rounded-lg border-2 border-terminal shadow-md">
            <img
              src="/qr/daily-cause.png"
              alt="Daily Cause QR Code"
              className="w-28 h-28 rounded"
            />
          </div>
          
          <button
            onClick={handleDonate}
            className="w-full bg-terminal text-black px-4 py-3 rounded font-bold shadow hover:bg-terminal/80 active:bg-terminal/90 transition text-center tracking-widest font-mono text-sm"
          >
            DONATE
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center font-mono">
          Click DONATE to open the donation page within the Mini App.
        </p>
        
        <p className="text-xs text-gray-400 text-center font-mono mt-2">
          Next cause: {nextChange}
        </p>
      </div>
    </div>
  );
} 