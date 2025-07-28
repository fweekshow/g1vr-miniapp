import { createPublicClient, http, parseAbi, createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';

// Zora Creator Coin ABI (ERC20 with minting)
const ZORA_COIN_ABI = parseAbi([
  'function mint(address to, uint256 amount) external',
  'function balanceOf(address owner) external view returns (uint256)',
  'function hasClaimed(address user) external view returns (bool)',
  'function canClaim(address user) external view returns (bool)',
  'function calculateClaimAmount(address user) external view returns (uint256)',
  'event TokensClaimed(address indexed user, uint256 amount)'
]);

// Your Zora creator coin address
const ZORA_COIN_ADDRESS = '0xf22834c5ccdb589c429c350fdec6122e6fe55d6f';

// Initialize Viem clients
const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

export interface ClaimStatus {
  canClaim: boolean;
  hasClaimed: boolean;
  balance: string;
  donationCount: number;
  totalDonated: string;
  claimAmount: string;
}

export class TokenClaimer {
  private static instance: TokenClaimer;

  static getInstance(): TokenClaimer {
    if (!TokenClaimer.instance) {
      TokenClaimer.instance = new TokenClaimer();
    }
    return TokenClaimer.instance;
  }

  // Check if user can claim tokens based on their donation history
  async checkClaimStatus(userAddress: string, donationHistory: any[]): Promise<ClaimStatus> {
    try {
      // Calculate donation stats
      const donationCount = donationHistory.length;
      const totalDonated = donationHistory.reduce((sum, donation) => {
        return sum + (parseInt(donation.usdcAmount || '0', 10) / 1e6);
      }, 0);

      // Check eligibility: donations over $0.24 get 100 coins (for testing)
      const eligibleDonations = donationHistory.filter(donation => {
        const amount = parseInt(donation.usdcAmount || '0', 10) / 1e6;
        return amount >= 0.24; // $0.24 minimum for testing
      });

      const canClaim = eligibleDonations.length > 0;
      const claimAmount = eligibleDonations.length * 100; // 100 coins per eligible donation

      // For now, simulate on-chain checks (you'll need to implement these in your smart contract)
      const hasClaimed = false; // This would come from your smart contract
      const balance = '0'; // This would come from your smart contract

      return {
        canClaim,
        hasClaimed,
        balance,
        claimAmount: (claimAmount * 1e18).toString(), // Convert to wei
        donationCount,
        totalDonated: totalDonated.toFixed(2)
      };
    } catch (error) {
      console.error('Error checking claim status:', error);
      return {
        canClaim: false,
        hasClaimed: false,
        balance: '0',
        claimAmount: '0',
        donationCount: 0,
        totalDonated: '0'
      };
    }
  }

  // Claim tokens
  async claimTokens(userAddress: string, walletClient: any): Promise<boolean> {
    try {
      const { request } = await publicClient.simulateContract({
        address: ZORA_COIN_ADDRESS as `0x${string}`,
        abi: ZORA_COIN_ABI,
        functionName: 'mint',
        args: [userAddress as `0x${string}`, 0n], // Amount will be calculated by contract
        account: userAddress as `0x${string}`
      });

      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });
      
      console.log('Zora creator coins claimed successfully:', hash);
      return true;
    } catch (error) {
      console.error('Error claiming tokens:', error);
      return false;
    }
  }

  // Get donation history for a user
  async getUserDonations(userAddress: string): Promise<any[]> {
    try {
      // This would integrate with your existing activity feed API
      const response = await fetch(`/api/activity?userAddress=${userAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user donations');
      }
      const data = await response.json();
      return data.filter((activity: any) => 
        activity.transactor?.toLowerCase() === userAddress.toLowerCase() ||
        activity.actualSender?.toLowerCase() === userAddress.toLowerCase()
      );
    } catch (error) {
      console.error('Error fetching user donations:', error);
      return [];
    }
  }
}

export default TokenClaimer; 