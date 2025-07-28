// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract G1VEToken is ERC20, Ownable {
    // Mapping to track if user has claimed
    mapping(address => bool) public hasClaimed;
    
    // Mapping to track donation amounts (in USDC, 6 decimals)
    mapping(address => uint256) public donationAmounts;
    
    // Claim threshold (minimum donation to be eligible)
    uint256 public constant CLAIM_THRESHOLD = 10 * 1e6; // $10 USDC
    
    // Tokens per dollar donated (18 decimals)
    uint256 public constant TOKENS_PER_DOLLAR = 100 * 1e18; // 100 tokens per $1
    
    event TokensClaimed(address indexed user, uint256 amount);
    event DonationRecorded(address indexed user, uint256 amount);

    constructor() ERC20("G1VE Token", "G1VE") Ownable(msg.sender) {
        // Initial supply can be minted by owner
    }

    /**
     * @dev Record a donation for a user (called by owner/backend)
     */
    function recordDonation(address user, uint256 usdcAmount) external onlyOwner {
        donationAmounts[user] += usdcAmount;
        emit DonationRecorded(user, usdcAmount);
    }

    /**
     * @dev Check if user can claim tokens
     */
    function canClaim(address user) public view returns (bool) {
        return donationAmounts[user] >= CLAIM_THRESHOLD && !hasClaimed[user];
    }

    /**
     * @dev Calculate tokens to claim based on donations
     */
    function calculateClaimAmount(address user) public view returns (uint256) {
        if (hasClaimed[user]) return 0;
        
        uint256 donationInDollars = donationAmounts[user] / 1e6; // Convert from USDC (6 decimals) to dollars
        return donationInDollars * TOKENS_PER_DOLLAR;
    }

    /**
     * @dev Claim tokens based on donation amount
     */
    function claim() external {
        require(canClaim(msg.sender), "Not eligible to claim");
        
        uint256 claimAmount = calculateClaimAmount(msg.sender);
        require(claimAmount > 0, "No tokens to claim");
        
        hasClaimed[msg.sender] = true;
        _mint(msg.sender, claimAmount);
        
        emit TokensClaimed(msg.sender, claimAmount);
    }

    /**
     * @dev Mint tokens to owner (for initial distribution)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Get donation amount for a user
     */
    function getDonationAmount(address user) external view returns (uint256) {
        return donationAmounts[user];
    }

    /**
     * @dev Get donation amount in dollars
     */
    function getDonationAmountInDollars(address user) external view returns (uint256) {
        return donationAmounts[user] / 1e6;
    }
} 