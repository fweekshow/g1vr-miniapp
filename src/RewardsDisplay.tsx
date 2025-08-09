import React, { useEffect, useState } from 'react';
import { useWalletAuth } from './WalletAuthProvider';
import { useBaseAccount } from './BaseAccountProvider';
import TokenClaimer, { ClaimStatus } from './tokenClaimer';

export default function RewardsDisplay() {
  const { address: walletAddress } = useWalletAuth();
  const { address: baseAddress } = useBaseAccount();
  const [claimStatus, setClaimStatus] = useState<ClaimStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userAddress = walletAddress || baseAddress;

  useEffect(() => {
    if (!userAddress) {
      setIsLoading(false);
      return;
    }

    checkClaimStatus();
  }, [userAddress]);

  const checkClaimStatus = async () => {
    if (!userAddress) return;

    try {
      setIsLoading(true);
      setError(null);

      const claimer = TokenClaimer.getInstance();
      const donations = await claimer.getUserDonations(userAddress);
      const status = await claimer.checkClaimStatus(userAddress, donations);
      
      setClaimStatus(status);
    } catch (err) {
      console.error('Error checking claim status:', err);
      setError('Failed to check claim status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!userAddress || !claimStatus?.canClaim) return;

    try {
      setIsClaiming(true);
      setError(null);

      const claimer = TokenClaimer.getInstance();
      const success = await claimer.claimTokens(userAddress, window.ethereum);

      if (success) {
        // Refresh claim status
        await checkClaimStatus();
      } else {
        setError('Failed to claim tokens');
      }
    } catch (err) {
      console.error('Error claiming tokens:', err);
      setError('Failed to claim tokens');
    } finally {
      setIsClaiming(false);
    }
  };

  if (!userAddress) {
    return (
      <div className="text-center p-4">
        <h2 className="text-lg font-bold mb-2 text-terminal font-mono">CONNECT TO VIEW REWARDS</h2>
        <p className="text-gray-400 font-mono text-sm">Connect your wallet to see your donation rewards and achievements.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="text-terminal font-mono">LOADING REWARDS...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <h2 className="text-lg font-bold mb-2 text-red-400 font-mono">ERROR</h2>
        <p className="text-red-400 font-mono text-sm">{error}</p>
        <button
          onClick={checkClaimStatus}
          className="mt-3 bg-terminal text-black px-4 py-2 rounded font-bold hover:bg-terminal/80 font-mono text-sm"
        >
          RETRY
        </button>
      </div>
    );
  }

  if (!claimStatus) {
    return (
      <div className="text-center p-4">
        <h2 className="text-lg font-bold mb-2 text-terminal font-mono">START YOUR GIVING JOURNEY</h2>
        <p className="text-gray-400 font-mono text-sm">Make your first donation to start earning rewards and achievements!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-sm font-semibold text-terminal tracking-wide font-mono">
          YOUR REWARDS
        </h2>
      </div>
      
      <div className="card-layout-compact">
        {/* Donation Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-terminal font-mono">
              {claimStatus.donationCount}
            </div>
            <div className="text-xs text-gray-400 font-mono">DONATIONS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-terminal font-mono">
              ${claimStatus.totalDonated}
            </div>
            <div className="text-xs text-gray-400 font-mono">TOTAL DONATED</div>
          </div>
        </div>

        {/* Token Balance */}
        <div className="mb-6">
          <div className="text-center">
            <div className="text-lg font-bold text-terminal font-mono">
              {(parseInt(claimStatus.balance) / 1e18).toFixed(2)}
            </div>
            <div className="text-xs text-gray-400 font-mono">FREAKSH00W COINS HELD</div>
          </div>
        </div>

        {/* Claimable Amount */}
        {claimStatus.canClaim && !claimStatus.hasClaimed && (
          <div className="mb-6">
            <div className="text-center">
              <div className="text-lg font-bold text-terminal font-mono">
                {(parseInt(claimStatus.claimAmount) / 1e18).toFixed(2)}
              </div>
              <div className="text-xs text-gray-400 font-mono">CLAIMABLE</div>
            </div>
          </div>
        )}

        {/* Claim Status */}
        {claimStatus.hasClaimed ? (
          <div className="text-center mb-4">
            <div className="bg-terminal/10 border border-terminal rounded p-3">
              <div className="text-sm text-terminal font-mono font-bold">
                ✅ COINS CLAIMED
              </div>
              <div className="text-xs text-gray-400 font-mono mt-1">
                You've already claimed freaksh00w's creator coins for your donations.
              </div>
            </div>
          </div>
        ) : claimStatus.canClaim ? (
          <div className="text-center mb-4">
            <div className="bg-terminal/10 border border-terminal rounded p-3 mb-4">
              <div className="text-sm text-terminal font-mono font-bold">
                🎉 ELIGIBLE TO CLAIM
              </div>
              <div className="text-xs text-gray-400 font-mono mt-1">
                You can claim freaksh00w's creator coins for your donations!
              </div>
            </div>
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="w-full bg-terminal text-black px-4 py-3 rounded font-bold hover:bg-terminal/80 active:bg-terminal/90 transition text-center tracking-widest font-mono text-sm disabled:opacity-50"
            >
              {isClaiming ? 'CLAIMING...' : 'CLAIM COINS'}
            </button>
          </div>
        ) : (
          <div className="text-center mb-4">
            <div className="bg-gray-800 border border-gray-600 rounded p-3">
              <div className="text-sm text-gray-400 font-mono font-bold">
                ⏳ NOT ELIGIBLE YET
              </div>
              <div className="text-xs text-gray-500 font-mono mt-1">
                Donate $0.24+ to become eligible for 100 freaksh00w coins per donation.
              </div>
            </div>
          </div>
        )}

        {/* Next Milestone */}
        <div className="text-center">
          <div className="text-xs text-gray-400 font-mono mb-2">NEXT MILESTONE</div>
          <div className="text-sm text-terminal font-mono">
            {getNextMilestone(claimStatus)}
          </div>
        </div>

        {/* Info */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-400 font-mono">
            Get 100 freaksh00w coins for each donation of $0.24 or more. Support causes and earn rewards!
          </p>
        </div>
      </div>
    </div>
  );
}

function getNextMilestone(rewards: ClaimStatus): string {
  const milestones = [
    { amount: 100, name: 'First $100' },
    { amount: 500, name: 'Generous Giver' },
    { amount: 1000, name: 'Philanthropist' },
    { streak: 7, name: 'Week Warrior' },
    { streak: 30, name: 'Monthly Master' },
    { streak: 365, name: 'Year of Giving' }
  ];

  for (const milestone of milestones) {
    if (milestone.amount && parseFloat(rewards.totalDonated) < milestone.amount) {
      const remaining = milestone.amount - parseFloat(rewards.totalDonated);
      return `$${remaining.toFixed(2)} to ${milestone.name}`;
    }
    if (milestone.streak && rewards.donationCount < milestone.streak) {
      const remaining = milestone.streak - rewards.donationCount;
      return `${remaining} more donations to ${milestone.name}`;
    }
  }

  return 'All milestones achieved! 🎉';
} 