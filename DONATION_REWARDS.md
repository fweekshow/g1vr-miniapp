# G1VE Donation Rewards System

## Overview

The donation rewards system allows users to claim Zora creator coins based on their donation history. Users who donate to causes through the G1VE app become eligible for creator coin claims.

## Features

### 🎯 **Creator Coin Claiming**
- Users can claim Zora creator coins if they've made donations
- Minimum $10 USDC donation required to be eligible
- Creator coins awarded based on donation amount
- One-time claim per user

### 📊 **Donation Tracking**
- Integrates with existing ActivityFeed
- Tracks donation amounts and transaction hashes
- Records donations on-chain for transparency

### 🏆 **Rewards Display**
- Shows donation statistics
- Displays token balance
- Tracks claim eligibility

## Smart Contract

### Zora Creator Coin (`0xf22834c5ccdb589c429c350fdec6122e6fe55d6f`)
- Existing Zora creator coin on Base
- Tracks donation amounts per user
- Enforces minimum donation threshold
- Prevents double claiming

### Key Functions:
- `recordDonation(address user, uint256 usdcAmount)` - Record a donation
- `mint(address to, uint256 amount)` - Claim creator coins
- `canClaim(address user)` - Check eligibility
- `calculateClaimAmount(address user)` - Calculate claimable coins

## API Endpoints

### `/api/record-donation`
Records a donation on-chain for token claiming.

**POST Request:**
```json
{
  "userAddress": "0x...",
  "usdcAmount": "1000000", // 6 decimals
  "transactionHash": "0x..."
}
```

## Environment Variables

Add these to your `.env.local`:

```env
# Zora Creator Coin (already deployed on Base)
VITE_ZORA_COIN_ADDRESS=0xf22834c5ccdb589c429c350fdec6122e6fe55d6f

# Owner Private Key (for recording donations)
OWNER_PRIVATE_KEY=0x...

# Deposit Address to Monitor
VITE_DEPOSIT_ADDRESS=0x...
```

## Deployment Steps

### 1. Smart Contract Already Deployed
Your Zora creator coin is already deployed on Base at `0xf22834c5ccdb589c429c350fdec6122e6fe55d6f`

### 2. Set Environment Variables
Update your `.env.local` with the creator coin address and owner private key.

### 3. Configure Deposit Monitoring
Set the deposit address that your activity feed monitors.

## Usage Flow

1. **User makes donation** → ActivityFeed tracks it
2. **Backend records donation** → Calls `/api/record-donation`
3. **User checks eligibility** → TokenClaiming component
4. **User claims tokens** → Smart contract mints tokens

## Creator Coin Economics

- **Minimum Donation:** $10 USDC
- **Reward Rate:** Based on donation amount and creator coin logic
- **Example:** $50 donation = creator coins based on Zora algorithm
- **Supply:** Controlled by Zora creator coin contract

## Security Features

- ✅ **One-time claiming** - Prevents double claims
- ✅ **Minimum threshold** - Ensures meaningful donations
- ✅ **On-chain verification** - Transparent and auditable
- ✅ **Owner controls** - Only authorized backend can record donations

## Future Enhancements

- **Streak bonuses** - Extra tokens for consecutive donations
- **Milestone rewards** - Special tokens for donation milestones
- **Social features** - Share achievements on Farcaster
- **Governance** - Token holders can vote on causes 