// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
}

interface IERC4907 {
    function userOf(uint256 tokenId) external view returns (address);

    function userExpires(uint256 tokenId) external view returns (uint256);
}

contract VPCToken is
    ERC20,
    ERC20Burnable,
    ERC20Pausable,
    Ownable,
    ReentrancyGuard
{
    struct Stake {
        uint256 amount;
        uint256 stakeTime;
        uint256 lockPeriod; // in days
        uint256 rewardRate; // reward rate per day in basis points
        bool isActive;
    }

    struct RentalReward {
        uint256 tokenId;
        uint256 rentalStartTime;
        uint256 rentalDuration;
        uint256 dailyReward;
        bool claimed;
    }

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10 ** 18; // 100 million initial

    // Staking parameters
    uint256 public baseRewardRate = 100; // 1% per day (100 basis points)
    uint256 public minimumStakeAmount = 100 * 10 ** 18; // 100 tokens
    uint256 public maximumStakeAmount = 1_000_000 * 10 ** 18; // 1M tokens

    // Lock periods and their reward multipliers
    mapping(uint256 => uint256) public lockPeriodMultipliers;
    uint256[] public availableLockPeriods;

    // Rental rewards
    uint256 public rentalRewardRate = 50; // 0.5% per day for rental activities
    uint256 public ownerRentalRewardRate = 25; // 0.25% per day for NFT owners when rented

    // Fee discounts for VPC holders
    mapping(uint256 => uint256) public feeDiscountTiers; // VPC amount -> discount percentage

    // Contract references
    IERC721 public nftContract;
    IERC4907 public rentableNFT;
    address public marketplaceContract;
    address public auctionContract;
    address public lendingContract;

    // User data
    mapping(address => Stake[]) public userStakes;
    mapping(address => RentalReward[]) public userRentalRewards;
    mapping(address => uint256) public totalStaked;
    mapping(address => uint256) public lastRewardClaim;

    // Platform rewards pool
    uint256 public rewardsPool;
    uint256 public platformRevenue;

    event Staked(
        address indexed user,
        uint256 amount,
        uint256 lockPeriod,
        uint256 stakeIndex
    );
    event Unstaked(address indexed user, uint256 amount, uint256 stakeIndex);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RentalRewardAdded(
        address indexed user,
        uint256 tokenId,
        uint256 reward
    );
    event PlatformFeePaid(
        address indexed user,
        uint256 amount,
        uint256 discount
    );

    constructor(
        address _nftContract,
        address _initialOwner
    ) ERC20("ViePropChain Token", "VPC") Ownable(_initialOwner) {
        nftContract = IERC721(_nftContract);
        rentableNFT = IERC4907(_nftContract);

        // Initialize lock periods and multipliers
        availableLockPeriods = [30, 90, 180, 365]; // 30 days, 3 months, 6 months, 1 year
        lockPeriodMultipliers[30] = 10000; // 1x multiplier (100%)
        lockPeriodMultipliers[90] = 12500; // 1.25x multiplier
        lockPeriodMultipliers[180] = 15000; // 1.5x multiplier
        lockPeriodMultipliers[365] = 20000; // 2x multiplier

        // Initialize fee discount tiers (amount in tokens -> discount percentage)
        feeDiscountTiers[1000 * 10 ** 18] = 5; // 1K tokens = 5% discount
        feeDiscountTiers[10000 * 10 ** 18] = 10; // 10K tokens = 10% discount
        feeDiscountTiers[100000 * 10 ** 18] = 20; // 100K tokens = 20% discount
        feeDiscountTiers[1000000 * 10 ** 18] = 35; // 1M tokens = 35% discount

        // Mint initial supply to owner
        _mint(_initialOwner, INITIAL_SUPPLY);

        // Initialize rewards pool
        rewardsPool = 50_000_000 * 10 ** 18; // 50 million tokens for rewards
        _mint(address(this), rewardsPool);
    }

    // Override required by Solidity for multiple inheritance
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }

    // Staking functions
    function stake(
        uint256 _amount,
        uint256 _lockPeriod
    ) external whenNotPaused nonReentrant {
        require(_amount >= minimumStakeAmount, "Amount too low");
        require(_amount <= maximumStakeAmount, "Amount too high");
        require(lockPeriodMultipliers[_lockPeriod] > 0, "Invalid lock period");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");

        // Transfer tokens to contract
        _transfer(msg.sender, address(this), _amount);

        uint256 adjustedRewardRate = (baseRewardRate *
            lockPeriodMultipliers[_lockPeriod]) / 10000;

        // Create stake
        userStakes[msg.sender].push(
            Stake({
                amount: _amount,
                stakeTime: block.timestamp,
                lockPeriod: _lockPeriod,
                rewardRate: adjustedRewardRate,
                isActive: true
            })
        );

        totalStaked[msg.sender] += _amount;

        emit Staked(
            msg.sender,
            _amount,
            _lockPeriod,
            userStakes[msg.sender].length - 1
        );
    }

    function unstake(uint256 _stakeIndex) external nonReentrant {
        require(
            _stakeIndex < userStakes[msg.sender].length,
            "Invalid stake index"
        );

        Stake storage userStake = userStakes[msg.sender][_stakeIndex];
        require(userStake.isActive, "Stake not active");

        uint256 lockEndTime = userStake.stakeTime +
            (userStake.lockPeriod * 1 days);
        require(block.timestamp >= lockEndTime, "Stake still locked");

        uint256 stakeAmount = userStake.amount;
        userStake.isActive = false;
        totalStaked[msg.sender] -= stakeAmount;

        // Calculate and distribute rewards
        uint256 rewards = calculateStakeRewards(_stakeIndex, msg.sender);
        if (rewards > 0 && rewardsPool >= rewards) {
            rewardsPool -= rewards;
            _transfer(address(this), msg.sender, rewards);
        }

        // Return staked tokens
        _transfer(address(this), msg.sender, stakeAmount);

        emit Unstaked(msg.sender, stakeAmount, _stakeIndex);

        if (rewards > 0) {
            emit RewardsClaimed(msg.sender, rewards);
        }
    }

    function claimStakeRewards() external nonReentrant {
        uint256 totalRewards = 0;

        for (uint256 i = 0; i < userStakes[msg.sender].length; i++) {
            if (userStakes[msg.sender][i].isActive) {
                totalRewards += calculateStakeRewards(i, msg.sender);
                userStakes[msg.sender][i].stakeTime = block.timestamp; // Reset reward calculation
            }
        }

        require(totalRewards > 0, "No rewards to claim");
        require(rewardsPool >= totalRewards, "Insufficient rewards pool");

        rewardsPool -= totalRewards;
        _transfer(address(this), msg.sender, totalRewards);

        lastRewardClaim[msg.sender] = block.timestamp;
        emit RewardsClaimed(msg.sender, totalRewards);
    }

    function calculateStakeRewards(
        uint256 _stakeIndex,
        address _user
    ) public view returns (uint256) {
        if (_stakeIndex >= userStakes[_user].length) return 0;

        Stake memory userStake = userStakes[_user][_stakeIndex];
        if (!userStake.isActive) return 0;

        uint256 stakingDays = (block.timestamp - userStake.stakeTime) / 1 days;
        if (stakingDays == 0) return 0;

        return (userStake.amount * userStake.rewardRate * stakingDays) / 10000;
    }

    // Rental reward functions
    function addRentalReward(
        address _user,
        uint256 _tokenId,
        uint256 _rentalDuration,
        uint256 _dailyRate
    ) external {
        require(
            msg.sender == marketplaceContract ||
                msg.sender == auctionContract ||
                msg.sender == lendingContract,
            "Only authorized contracts"
        );

        uint256 dailyReward = (_dailyRate * rentalRewardRate) / 10000;

        userRentalRewards[_user].push(
            RentalReward({
                tokenId: _tokenId,
                rentalStartTime: block.timestamp,
                rentalDuration: _rentalDuration,
                dailyReward: dailyReward,
                claimed: false
            })
        );

        // Also reward NFT owner
        address owner = nftContract.ownerOf(_tokenId);
        if (owner != _user) {
            uint256 ownerDailyReward = (_dailyRate * ownerRentalRewardRate) /
                10000;
            userRentalRewards[owner].push(
                RentalReward({
                    tokenId: _tokenId,
                    rentalStartTime: block.timestamp,
                    rentalDuration: _rentalDuration,
                    dailyReward: ownerDailyReward,
                    claimed: false
                })
            );
        }

        emit RentalRewardAdded(_user, _tokenId, dailyReward);
    }

    function claimRentalRewards() external nonReentrant {
        uint256 totalRewards = 0;

        for (uint256 i = 0; i < userRentalRewards[msg.sender].length; i++) {
            RentalReward storage reward = userRentalRewards[msg.sender][i];

            if (!reward.claimed) {
                uint256 rewardPeriod = block.timestamp - reward.rentalStartTime;
                uint256 rewardDays = rewardPeriod / 1 days;

                if (rewardDays > 0) {
                    uint256 maxRewardDays = reward.rentalDuration;
                    if (rewardDays > maxRewardDays) rewardDays = maxRewardDays;

                    totalRewards += reward.dailyReward * rewardDays;
                    reward.claimed = true;
                }
            }
        }

        require(totalRewards > 0, "No rental rewards to claim");
        require(rewardsPool >= totalRewards, "Insufficient rewards pool");

        rewardsPool -= totalRewards;
        _transfer(address(this), msg.sender, totalRewards);

        emit RewardsClaimed(msg.sender, totalRewards);
    }

    // Fee discount functions
    function getFeeDiscount(address _user) external view returns (uint256) {
        uint256 userBalance = balanceOf(_user) + totalStaked[_user];
        uint256 discount = 0;

        // Find highest applicable discount tier
        if (userBalance >= 1000000 * 10 ** 18) {
            discount = 35;
        } else if (userBalance >= 100000 * 10 ** 18) {
            discount = 20;
        } else if (userBalance >= 10000 * 10 ** 18) {
            discount = 10;
        } else if (userBalance >= 1000 * 10 ** 18) {
            discount = 5;
        }

        return discount;
    }

    function payPlatformFee(
        address _user,
        uint256 _baseAmount
    ) external returns (uint256) {
        require(
            msg.sender == marketplaceContract ||
                msg.sender == auctionContract ||
                msg.sender == lendingContract,
            "Only authorized contracts"
        );

        uint256 discount = this.getFeeDiscount(_user);
        uint256 discountAmount = (_baseAmount * discount) / 100;
        uint256 finalAmount = _baseAmount - discountAmount;

        require(
            balanceOf(_user) >= finalAmount,
            "Insufficient VPC balance for fee"
        );

        _transfer(_user, address(this), finalAmount);
        platformRevenue += finalAmount;

        emit PlatformFeePaid(_user, finalAmount, discount);
        return finalAmount;
    }

    // Admin functions
    function setContracts(
        address _marketplace,
        address _auction,
        address _lending
    ) external onlyOwner {
        marketplaceContract = _marketplace;
        auctionContract = _auction;
        lendingContract = _lending;
    }

    function setRewardRates(
        uint256 _baseRewardRate,
        uint256 _rentalRewardRate,
        uint256 _ownerRentalRewardRate
    ) external onlyOwner {
        baseRewardRate = _baseRewardRate;
        rentalRewardRate = _rentalRewardRate;
        ownerRentalRewardRate = _ownerRentalRewardRate;
    }

    function setStakeLimits(
        uint256 _minAmount,
        uint256 _maxAmount
    ) external onlyOwner {
        minimumStakeAmount = _minAmount;
        maximumStakeAmount = _maxAmount;
    }

    function addRewardsToPool(uint256 _amount) external onlyOwner {
        require(totalSupply() + _amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(address(this), _amount);
        rewardsPool += _amount;
    }

    function withdrawPlatformRevenue(
        address _to,
        uint256 _amount
    ) external onlyOwner {
        require(_amount <= platformRevenue, "Insufficient revenue");
        platformRevenue -= _amount;
        _transfer(address(this), _to, _amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // View functions
    function getUserStakes(
        address _user
    ) external view returns (Stake[] memory) {
        return userStakes[_user];
    }

    function getUserRentalRewards(
        address _user
    ) external view returns (RentalReward[] memory) {
        return userRentalRewards[_user];
    }

    function getTotalUserRewards(
        address _user
    ) external view returns (uint256) {
        uint256 totalRewards = 0;

        // Calculate staking rewards
        for (uint256 i = 0; i < userStakes[_user].length; i++) {
            totalRewards += calculateStakeRewards(i, _user);
        }

        // Calculate rental rewards
        for (uint256 i = 0; i < userRentalRewards[_user].length; i++) {
            RentalReward memory reward = userRentalRewards[_user][i];
            if (!reward.claimed) {
                uint256 rewardPeriod = block.timestamp - reward.rentalStartTime;
                uint256 rewardDays = rewardPeriod / 1 days;
                if (rewardDays > reward.rentalDuration) {
                    rewardDays = reward.rentalDuration;
                }
                totalRewards += reward.dailyReward * rewardDays;
            }
        }

        return totalRewards;
    }

    function getAvailableLockPeriods()
        external
        view
        returns (uint256[] memory)
    {
        return availableLockPeriods;
    }
}
