import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Zora Creator Coin ABI
const ZORA_COIN_ABI = parseAbi([
  'function recordDonation(address user, uint256 usdcAmount) external'
]);

// Initialize Viem client
const client = createPublicClient({
  chain: base,
  transport: http()
});

// Your Zora creator coin address
const ZORA_COIN_ADDRESS = '0xf22834c5ccdb589c429c350fdec6122e6fe55d6f';

// Owner private key (for signing transactions)
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userAddress, usdcAmount, transactionHash } = req.body;

    // Validate input
    if (!userAddress || !usdcAmount || !transactionHash) {
      return res.status(400).json({ 
        error: 'Missing required fields: userAddress, usdcAmount, transactionHash' 
      });
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({ error: 'Invalid user address format' });
    }

    // Validate amount
    const amount = parseInt(usdcAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid USDC amount' });
    }

    // Check if we have the required environment variables
    if (!OWNER_PRIVATE_KEY) {
      return res.status(500).json({ 
        error: 'Owner private key not configured' 
      });
    }

    if (ZORA_COIN_ADDRESS === '0x0000000000000000000000000000000000000000') {
      return res.status(500).json({ 
        error: 'Zora coin address not configured' 
      });
    }

    // Create account from private key
    const account = privateKeyToAccount(OWNER_PRIVATE_KEY);

    // Record donation on-chain
    const { request } = await client.simulateContract({
      address: ZORA_COIN_ADDRESS,
      abi: ZORA_COIN_ABI,
      functionName: 'recordDonation',
      args: [userAddress, amount],
      account
    });

    // Send transaction
    const hash = await client.writeContract(request);
    
    // Wait for transaction confirmation
    const receipt = await client.waitForTransactionReceipt({ hash });

    console.log('Donation recorded on-chain:', {
      userAddress,
      usdcAmount: amount,
      transactionHash,
      onChainTxHash: hash
    });

    res.status(200).json({
      success: true,
      onChainTxHash: hash,
      receipt
    });

  } catch (error) {
    console.error('Error recording donation:', error);
    res.status(500).json({ 
      error: 'Failed to record donation on-chain',
      details: error.message 
    });
  }
} 