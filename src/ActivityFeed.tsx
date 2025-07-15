import React, { useEffect, useState } from 'react';
import { causes } from './causes';

interface Activity {
  id?: string;
  type: string;
  usdcAmount: string;
  occurredAtUtc: string;
  transactor: string;
  actualSender?: string;
  transactionHash?: string;
  chainId?: number;
  to?: {
    name: string;
  };
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current date in Pacific Time and find today's cause
  const pacific = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
  const today = new Date(pacific).toISOString().split('T')[0];
  const todayCause = causes.find(c => c.date === today);

  // Helper to extract EIN from external_link and remove hyphens
  function extractEinFromUrl(url: string) {
    const match = url && url.match(/orgs\/([\d-]+)/);
    return match ? match[1].replace(/-/g, '') : null;
  }
  
  const ein = todayCause ? extractEinFromUrl(todayCause.external_link) : null;

  useEffect(() => {
    if (!ein) return;
    
    let isMounted = true;
    setLoading(true);
    setError(null);
    
    // Use local API with BaseScan extraction
    const apiUrl = `/api/activity?orgId=${ein}`;
    
    fetch(apiUrl)
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => {
            throw new Error(`Failed to fetch activity: ${res.status} - ${text}`);
          });
        }
        return res.json();
      })
      .then((data: Activity[]) => {
        if (!isMounted) return;
        console.log('Activity data from API:', data);
        setActivities(data);
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('ActivityFeed error:', err);
        setError(`Failed to load activity: ${err.message}`);
        setLoading(false);
      });
      
    return () => {
      isMounted = false;
    };
  }, [ein]);

  if (!ein) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="card-layout">
          <h2 className="text-xl font-bold text-terminal mb-4 text-center font-mono">
            RECENT ACTIVITY
          </h2>
          <p className="text-gray-400 text-center font-mono">No cause found for today.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="card-layout">
          <h2 className="text-xl font-bold text-terminal mb-4 text-center font-mono">
            RECENT ACTIVITY
          </h2>
          <p className="text-gray-400 text-center font-mono">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="card-layout">
          <h2 className="text-xl font-bold text-terminal mb-4 text-center font-mono">
            RECENT ACTIVITY
          </h2>
          <p className="text-red-400 text-center font-mono">Error: {error}</p>
          <p className="text-gray-400 text-center font-mono text-sm mt-2">
            The activity feed is temporarily unavailable. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-terminal text-black px-4 py-2 rounded font-bold hover:bg-terminal/80 font-mono"
          >
            RETRY
          </button>
        </div>
      </div>
    );
  }

  // Only show the 5 most recent donations or grants
  const filteredActivities = activities
    .filter(a => a.type === 'donation' || a.type === 'grant')
    .slice(0, 5);

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="card-layout">
        <h2 className="text-xl font-bold text-terminal mb-4 text-center font-mono">
          RECENT ACTIVITY
        </h2>
        
        {filteredActivities.length === 0 ? (
          <p className="text-gray-400 text-center font-mono">No recent activity found.</p>
        ) : (
          <ul className="space-y-3">
            {filteredActivities.map((activity, index) => {
              const amount = activity.usdcAmount || '0';
              const formattedAmount = (parseInt(amount, 10) / 1e6).toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              });
              
              // Use actualSender if available, fallback to transactor
              const senderAddress = activity.actualSender || activity.transactor;
              const shortenAddress = (address: string) => 
                address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown';
              

              
              return (
                <li key={activity.id || `activity-${index}`} className="border-b border-terminal pb-2 last:border-b-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold capitalize text-terminal font-mono">
                      {activity.type}
                    </span>
                    <span className="text-terminal font-bold font-mono">
                      ${formattedAmount} USDC
                    </span>
                  </div>
                  
                  {activity.to?.name && (
                    <p className="text-sm text-gray-300 mb-1 font-mono">
                      to {activity.to.name}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-400 font-mono">
                    {new Date(activity.occurredAtUtc).toLocaleString()} by {shortenAddress(senderAddress)}
                    <a 
                      href={`https://basescan.org/address/${senderAddress}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-terminal hover:text-terminal/80 ml-1"
                    >
                      (View)
                    </a>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
} 