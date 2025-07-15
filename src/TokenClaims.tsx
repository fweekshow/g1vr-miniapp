import React, { useState } from 'react';
import { useAccount } from 'wagmi';

interface ClaimEligibility {
  eligible: boolean;
  amount: number;
  donationDate: string;
  causeName: string;
}

export default function TokenClaims() {
  const { address, isConnected } = useAccount();
  const [claims, setClaims] = useState<ClaimEligibility[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState<string[]>([]);

  const checkEligibility = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      // This would call your main app's API to check donation history
      // For now, showing mock data
      const mockClaims: ClaimEligibility[] = [
        {
          eligible: true,
          amount: 1000,
          donationDate: '2025-01-15',
          causeName: 'MusiCares'
        }
      ];
      setClaims(mockClaims);
    } catch (error) {
      console.error('Error checking eligibility:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimTokens = async (donationDate: string) => {
    if (!address) return;
    
    try {
      // This would call your token contract to mint tokens
      console.log('Claiming tokens for donation on:', donationDate);
      setClaimed(prev => [...prev, donationDate]);
    } catch (error) {
      console.error('Error claiming tokens:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="card-layout">
          <h2 className="text-xl font-bold text-terminal mb-4 text-center font-mono">
            TOKEN CLAIMS
          </h2>
          <p className="text-gray-400 text-center font-mono">
            Connect your wallet to check for eligible token claims.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="card-layout">
        <h2 className="text-xl font-bold text-terminal mb-4 text-center font-mono">
          TOKEN CLAIMS
        </h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-300 mb-2 font-mono">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          <button
            onClick={checkEligibility}
            disabled={loading}
            className="w-full bg-terminal text-black px-4 py-2 rounded font-bold hover:bg-terminal/80 disabled:opacity-50 font-mono"
          >
            {loading ? 'CHECKING...' : 'CHECK ELIGIBILITY'}
          </button>
        </div>

        {claims.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-terminal font-mono">ELIGIBLE CLAIMS:</h3>
            {claims.map((claim, index) => (
              <div key={index} className="border border-terminal rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-200 font-mono">{claim.causeName}</span>
                  <span className="text-terminal font-bold font-mono">{claim.amount} GIVR</span>
                </div>
                <p className="text-sm text-gray-400 mb-2 font-mono">
                  Donated on: {claim.donationDate}
                </p>
                {claimed.includes(claim.donationDate) ? (
                  <span className="text-terminal text-sm font-medium font-mono">✓ CLAIMED</span>
                ) : (
                  <button
                    onClick={() => claimTokens(claim.donationDate)}
                    className="bg-terminal text-black px-3 py-1 rounded text-sm hover:bg-terminal/80 font-mono font-bold"
                  >
                    CLAIM TOKENS
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {claims.length === 0 && !loading && (
          <p className="text-gray-400 text-center font-mono">
            No eligible claims found. Make a donation of $5+ to earn tokens!
          </p>
        )}
      </div>
    </div>
  );
} 