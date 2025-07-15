import React, { useEffect, useState } from 'react';
import { causes } from './causes';

interface Cause {
  date: string;
  name: string;
  description: string;
  external_link: string;
}

export default function DailyCause() {
  const [cause, setCause] = useState<Cause | null>(null);

  useEffect(() => {
    // Get current date in Pacific Time
    const pacific = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    const today = new Date(pacific).toISOString().split('T')[0];
    const match = causes.find(c => c.date === today);
    setCause(match || null);
  }, []);

  if (!cause) {
    return (
      <div className="text-center p-4">
        <h2 className="text-xl font-bold mb-2 text-terminal font-mono">CAUSE COMING SOON</h2>
        <p className="text-gray-400 font-mono">Please check back later for today's featured cause.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-terminal tracking-wide font-mono">
          DAILY REVOLVING QR CODE
        </h2>
      </div>
      
      <div className="card-layout">
        <h1 className="text-xl font-bold text-terminal mb-3 text-center font-mono tracking-wide">
          {cause.name}
        </h1>
        
        <p className="text-sm text-gray-200 mb-6 leading-relaxed font-mono">
          {cause.description}
        </p>

        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="bg-white p-3 rounded-xl border-2 border-terminal shadow-md">
            <img
              src="/qr/daily-cause.png"
              alt="Daily Cause QR Code"
              className="w-48 h-48 rounded-lg"
            />
          </div>
          
          <a
            href={cause.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-xs bg-terminal text-black px-6 py-3 rounded font-bold shadow hover:bg-terminal/80 active:bg-terminal/90 transition text-center tracking-widest font-mono"
          >
            DONATE
          </a>
        </div>

        <p className="text-xs text-gray-400 text-center font-mono">
          Scan the QR code above with your phone's camera to donate directly to today's cause.
        </p>
      </div>
    </div>
  );
} 