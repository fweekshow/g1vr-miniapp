import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';

// ABI for ERC20 transfer events
const ERC20_ABI = parseAbi([
  'event Transfer(address indexed from, address indexed to, uint256 value)'
]);

// Donation tracking interface
export interface Donation {
  donorAddress: string;
  amount: string;
  timestamp: number;
  causeName: string;
  transactionHash: string;
}

export interface UserRewards {
  totalDonations: number;
  currentStreak: number;
  longestStreak: number;
  lastDonationDate: string | null;
  milestones: string[];
}

// Deposit address to monitor (you'll need to set this)
const DEPOSIT_ADDRESS = process.env.VITE_DEPOSIT_ADDRESS || '0x0000000000000000000000000000000000000000';

// Initialize Viem client for Base
const client = createPublicClient({
  chain: base,
  transport: http()
});

// Track donations in memory (in production, use a database)
const donations: Donation[] = [];
const userRewards: Map<string, UserRewards> = new Map();

export class DonationTracker {
  private static instance: DonationTracker;
  private isTracking = false;

  static getInstance(): DonationTracker {
    if (!DonationTracker.instance) {
      DonationTracker.instance = new DonationTracker();
    }
    return DonationTracker.instance;
  }

  // Start tracking donations
  async startTracking() {
    if (this.isTracking) return;
    
    this.isTracking = true;
    console.log('Starting donation tracking...');
    
    // Poll for new donations every 30 seconds
    setInterval(() => {
      this.checkForNewDonations();
    }, 30000);
  }

  // Check for new donations
  private async checkForNewDonations() {
    try {
      // Get recent blocks and check for transfers to deposit address
      const latestBlock = await client.getBlockNumber();
      const fromBlock = latestBlock - 100n; // Check last 100 blocks
      
      const logs = await client.getLogs({
        address: DEPOSIT_ADDRESS as `0x${string}`,
        event: {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { type: 'address', name: 'from', indexed: true },
            { type: 'address', name: 'to', indexed: true },
            { type: 'uint256', name: 'value', indexed: false }
          ]
        },
        fromBlock,
        toBlock: latestBlock
      });

      for (const log of logs) {
        await this.processDonation(log);
      }
    } catch (error) {
      console.error('Error checking for donations:', error);
    }
  }

  // Process a donation
  private async processDonation(log: any) {
    const donation: Donation = {
      donorAddress: log.args.from,
      amount: log.args.value.toString(),
      timestamp: Date.now(),
      causeName: this.getCurrentCauseName(),
      transactionHash: log.transactionHash
    };

    donations.push(donation);
    this.updateUserRewards(donation);
    
    console.log('New donation processed:', donation);
  }

  // Get current cause name
  private getCurrentCauseName(): string {
    const today = new Date().toISOString().split('T')[0];
    // This would need to be integrated with your causes data
    return 'Current Cause';
  }

  // Update user rewards
  private updateUserRewards(donation: Donation) {
    const userAddress = donation.donorAddress.toLowerCase();
    const today = new Date().toISOString().split('T')[0];
    
    let userReward = userRewards.get(userAddress);
    if (!userReward) {
      userReward = {
        totalDonations: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastDonationDate: null,
        milestones: []
      };
    }

    // Update total donations
    userReward.totalDonations += parseFloat(donation.amount);

    // Update streak
    if (userReward.lastDonationDate === today) {
      // Already donated today, don't update streak
    } else if (userReward.lastDonationDate === this.getYesterday()) {
      // Consecutive day
      userReward.currentStreak += 1;
    } else {
      // Break in streak
      userReward.currentStreak = 1;
    }

    // Update longest streak
    if (userReward.currentStreak > userReward.longestStreak) {
      userReward.longestStreak = userReward.currentStreak;
    }

    userReward.lastDonationDate = today;

    // Check milestones
    this.checkMilestones(userReward);

    userRewards.set(userAddress, userReward);
  }

  // Get yesterday's date
  private getYesterday(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  // Check for milestone achievements
  private checkMilestones(userReward: UserRewards) {
    const milestones = [
      { amount: 100, name: 'First $100' },
      { amount: 500, name: 'Generous Giver' },
      { amount: 1000, name: 'Philanthropist' },
      { streak: 7, name: 'Week Warrior' },
      { streak: 30, name: 'Monthly Master' },
      { streak: 365, name: 'Year of Giving' }
    ];

    for (const milestone of milestones) {
      if (milestone.amount && userReward.totalDonations >= milestone.amount) {
        if (!userReward.milestones.includes(milestone.name)) {
          userReward.milestones.push(milestone.name);
        }
      }
      if (milestone.streak && userReward.currentStreak >= milestone.streak) {
        if (!userReward.milestones.includes(milestone.name)) {
          userReward.milestones.push(milestone.name);
        }
      }
    }
  }

  // Get user rewards
  getUserRewards(userAddress: string): UserRewards | null {
    return userRewards.get(userAddress.toLowerCase()) || null;
  }

  // Get all donations
  getAllDonations(): Donation[] {
    return [...donations];
  }

  // Get user donations
  getUserDonations(userAddress: string): Donation[] {
    return donations.filter(d => d.donorAddress.toLowerCase() === userAddress.toLowerCase());
  }
}

export default DonationTracker; 