// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IERC4907 {
    function setUser(uint256 tokenId, address user, uint64 expires) external;

    function userOf(uint256 tokenId) external view returns (address);

    function userExpires(uint256 tokenId) external view returns (uint256);
}

contract Lending is Ownable, ReentrancyGuard {
    struct LoanOffer {
        uint256 loanId;
        address lender;
        address borrower;
        uint256 tokenId;
        uint256 loanAmount;
        uint256 interestRate; // Annual interest rate in basis points (100 = 1%)
        uint256 loanDuration; // Duration in days
        uint256 collateralAmount; // Additional collateral required
        uint256 loanStartTime;
        uint256 totalRepaymentAmount;
        bool isActive;
        bool isRepaid;
        bool isDefaulted;
        LoanType loanType;
    }

    struct RentalLoan {
        uint256 loanId;
        address renter;
        uint256 tokenId;
        uint256 dailyRate;
        uint256 rentalDuration;
        uint256 rentalStartTime;
        uint256 rentalEndTime;
        uint256 totalAmount;
        bool isActive;
        bool isPaid;
    }

    enum LoanType {
        Collateral, // NFT as collateral for ETH loan
        Rental // Rent NFT for specific period
    }

    uint256 private _loanIds;
    uint256 public defaultInterestRate = 1000; // 10% annual
    uint256 public maxLoanDuration = 365 days;
    uint256 public defaultGracePeriod = 7 days;
    uint256 public platformFee = 200; // 2%

    IERC721 public nftContract;
    IERC4907 public rentableNFT;
    IERC20 public vpcToken; // VPC token for loans
    address payable public feeAccount;

    mapping(uint256 => LoanOffer) public loans;
    mapping(uint256 => RentalLoan) public rentals;
    mapping(uint256 => bool) public tokenInLoan; // Track if token is already in loan
    mapping(address => uint256[]) public borrowerLoans;
    mapping(address => uint256[]) public lenderLoans;

    event LoanOfferCreated(
        uint256 indexed loanId,
        address indexed lender,
        uint256 indexed tokenId,
        uint256 loanAmount,
        uint256 interestRate,
        LoanType loanType
    );

    event LoanAccepted(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 loanStartTime
    );

    event LoanRepaid(uint256 indexed loanId, uint256 repaymentAmount);

    event LoanDefaulted(uint256 indexed loanId, address indexed borrower);

    event RentalCreated(
        uint256 indexed loanId,
        address indexed renter,
        uint256 indexed tokenId,
        uint256 dailyRate,
        uint256 duration
    );

    event RentalPaid(
        uint256 indexed loanId,
        address indexed renter,
        uint256 amount
    );

    constructor(
        address _nftContract,
        address _vpcToken,
        address payable _feeAccount
    ) Ownable(msg.sender) {
        nftContract = IERC721(_nftContract);
        rentableNFT = IERC4907(_nftContract);
        vpcToken = IERC20(_vpcToken);
        feeAccount = _feeAccount;
    }

    modifier loanExists(uint256 _loanId) {
        require(loans[_loanId].loanId != 0, "Loan does not exist");
        _;
    }

    modifier rentalExists(uint256 _loanId) {
        require(rentals[_loanId].loanId != 0, "Rental does not exist");
        _;
    }

    // Create collateral loan offer (NFT as collateral)
    function createCollateralLoanOffer(
        uint256 _tokenId,
        uint256 _loanAmount,
        uint256 _interestRate,
        uint256 _loanDuration,
        uint256 _collateralAmount
    ) external {
        require(
            nftContract.ownerOf(_tokenId) == msg.sender,
            "You must own the NFT"
        );
        require(!tokenInLoan[_tokenId], "Token already in loan");
        require(_loanAmount > 0, "Loan amount must be greater than 0");
        require(
            _loanDuration > 0 && _loanDuration <= maxLoanDuration,
            "Invalid loan duration"
        );
        require(_interestRate <= 10000, "Interest rate too high"); // Max 100%

        // Transfer NFT to contract as collateral
        nftContract.transferFrom(msg.sender, address(this), _tokenId);

        _loanIds++;
        uint256 loanId = _loanIds;

        uint256 totalInterest = (_loanAmount * _interestRate * _loanDuration) /
            (365 * 10000);
        uint256 totalRepayment = _loanAmount + totalInterest;

        loans[loanId] = LoanOffer({
            loanId: loanId,
            lender: address(0), // Will be set when loan is accepted
            borrower: msg.sender,
            tokenId: _tokenId,
            loanAmount: _loanAmount,
            interestRate: _interestRate,
            loanDuration: _loanDuration,
            collateralAmount: _collateralAmount,
            loanStartTime: 0,
            totalRepaymentAmount: totalRepayment,
            isActive: false,
            isRepaid: false,
            isDefaulted: false,
            loanType: LoanType.Collateral
        });

        tokenInLoan[_tokenId] = true;
        borrowerLoans[msg.sender].push(loanId);

        emit LoanOfferCreated(
            loanId,
            msg.sender,
            _tokenId,
            _loanAmount,
            _interestRate,
            LoanType.Collateral
        );
    }

    // Accept collateral loan (lender provides ETH)
    function acceptCollateralLoan(
        uint256 _loanId
    ) external payable loanExists(_loanId) nonReentrant {
        LoanOffer storage loan = loans[_loanId];

        require(!loan.isActive, "Loan already active");
        require(msg.sender != loan.borrower, "Borrower cannot accept own loan");
        require(
            msg.value >= loan.loanAmount + loan.collateralAmount,
            "Insufficient payment"
        );

        loan.lender = msg.sender;
        loan.isActive = true;
        loan.loanStartTime = block.timestamp;

        lenderLoans[msg.sender].push(_loanId);

        // Send loan amount to borrower
        (bool sent, ) = payable(loan.borrower).call{value: loan.loanAmount}("");
        require(sent, "Failed to send loan amount");

        emit LoanAccepted(_loanId, loan.borrower, block.timestamp);
    }

    // Repay collateral loan
    function repayCollateralLoan(
        uint256 _loanId
    ) external payable loanExists(_loanId) nonReentrant {
        LoanOffer storage loan = loans[_loanId];

        require(loan.isActive, "Loan not active");
        require(!loan.isRepaid, "Loan already repaid");
        require(!loan.isDefaulted, "Loan defaulted");
        require(msg.sender == loan.borrower, "Only borrower can repay");
        require(
            msg.value >= loan.totalRepaymentAmount,
            "Insufficient repayment amount"
        );

        loan.isActive = false;
        loan.isRepaid = true;
        tokenInLoan[loan.tokenId] = false;

        uint256 fee = (loan.totalRepaymentAmount * platformFee) / 10000;
        uint256 lenderAmount = loan.totalRepaymentAmount - fee;

        // Send repayment to lender
        (bool sentLender, ) = payable(loan.lender).call{value: lenderAmount}(
            ""
        );
        require(sentLender, "Failed to send repayment to lender");

        // Send fee to platform
        (bool sentFee, ) = payable(feeAccount).call{value: fee}("");
        require(sentFee, "Failed to send fee");

        // Return NFT to borrower
        nftContract.transferFrom(address(this), loan.borrower, loan.tokenId);

        // Return excess collateral
        if (loan.collateralAmount > 0) {
            (bool sentCollateral, ) = payable(loan.lender).call{
                value: loan.collateralAmount
            }("");
            require(sentCollateral, "Failed to return collateral");
        }

        emit LoanRepaid(_loanId, loan.totalRepaymentAmount);
    }

    // Create rental offer using ERC4907
    function createRentalOffer(
        uint256 _tokenId,
        uint256 _dailyRate,
        uint256 _maxRentalDays
    ) external {
        require(
            nftContract.ownerOf(_tokenId) == msg.sender,
            "You must own the NFT"
        );
        require(_dailyRate > 0, "Daily rate must be greater than 0");
        require(
            _maxRentalDays > 0 && _maxRentalDays <= 365,
            "Invalid rental duration"
        );

        _loanIds++;
        uint256 loanId = _loanIds;

        loans[loanId] = LoanOffer({
            loanId: loanId,
            lender: msg.sender,
            borrower: address(0),
            tokenId: _tokenId,
            loanAmount: _dailyRate,
            interestRate: 0,
            loanDuration: _maxRentalDays,
            collateralAmount: 0,
            loanStartTime: 0,
            totalRepaymentAmount: 0,
            isActive: false,
            isRepaid: false,
            isDefaulted: false,
            loanType: LoanType.Rental
        });

        emit LoanOfferCreated(
            loanId,
            msg.sender,
            _tokenId,
            _dailyRate,
            0,
            LoanType.Rental
        );
    }

    // Rent NFT using ERC4907
    function rentNFT(
        uint256 _loanId,
        uint256 _rentalDays
    ) external payable loanExists(_loanId) nonReentrant {
        LoanOffer storage loan = loans[_loanId];

        require(loan.loanType == LoanType.Rental, "Not a rental offer");
        require(!loan.isActive, "Already rented");
        require(
            _rentalDays > 0 && _rentalDays <= loan.loanDuration,
            "Invalid rental duration"
        );
        require(msg.sender != loan.lender, "Owner cannot rent own NFT");

        uint256 totalAmount = loan.loanAmount * _rentalDays;
        require(msg.value >= totalAmount, "Insufficient payment");

        uint256 rentalEndTime = block.timestamp + (_rentalDays * 1 days);

        // Create rental record
        rentals[_loanId] = RentalLoan({
            loanId: _loanId,
            renter: msg.sender,
            tokenId: loan.tokenId,
            dailyRate: loan.loanAmount,
            rentalDuration: _rentalDays,
            rentalStartTime: block.timestamp,
            rentalEndTime: rentalEndTime,
            totalAmount: totalAmount,
            isActive: true,
            isPaid: true
        });

        loan.borrower = msg.sender;
        loan.isActive = true;
        loan.loanStartTime = block.timestamp;

        // Set rental user using ERC4907
        rentableNFT.setUser(loan.tokenId, msg.sender, uint64(rentalEndTime));

        uint256 fee = (totalAmount * platformFee) / 10000;
        uint256 ownerAmount = totalAmount - fee;

        // Send payment to NFT owner
        (bool sentOwner, ) = payable(loan.lender).call{value: ownerAmount}("");
        require(sentOwner, "Failed to send payment to owner");

        // Send fee to platform
        (bool sentFee, ) = payable(feeAccount).call{value: fee}("");
        require(sentFee, "Failed to send fee");

        emit RentalCreated(
            _loanId,
            msg.sender,
            loan.tokenId,
            loan.loanAmount,
            _rentalDays
        );
        emit RentalPaid(_loanId, msg.sender, totalAmount);
    }

    // Check if loan is defaulted
    function checkDefault(uint256 _loanId) external loanExists(_loanId) {
        LoanOffer storage loan = loans[_loanId];

        require(loan.isActive, "Loan not active");
        require(!loan.isRepaid, "Loan already repaid");
        require(
            loan.loanType == LoanType.Collateral,
            "Only for collateral loans"
        );

        uint256 repaymentDeadline = loan.loanStartTime +
            (loan.loanDuration * 1 days) +
            defaultGracePeriod;

        if (block.timestamp > repaymentDeadline) {
            loan.isDefaulted = true;
            loan.isActive = false;
            tokenInLoan[loan.tokenId] = false;

            // Transfer NFT to lender as liquidation
            nftContract.transferFrom(address(this), loan.lender, loan.tokenId);

            emit LoanDefaulted(_loanId, loan.borrower);
        }
    }

    // View functions
    function getLoan(uint256 _loanId) external view returns (LoanOffer memory) {
        return loans[_loanId];
    }

    function getRental(
        uint256 _loanId
    ) external view returns (RentalLoan memory) {
        return rentals[_loanId];
    }

    function getBorrowerLoans(
        address _borrower
    ) external view returns (uint256[] memory) {
        return borrowerLoans[_borrower];
    }

    function getLenderLoans(
        address _lender
    ) external view returns (uint256[] memory) {
        return lenderLoans[_lender];
    }

    function getTotalLoans() external view returns (uint256) {
        return _loanIds;
    }

    function isTokenInLoan(uint256 _tokenId) external view returns (bool) {
        return tokenInLoan[_tokenId];
    }

    function getCurrentRenter(
        uint256 _tokenId
    ) external view returns (address) {
        if (block.timestamp <= rentableNFT.userExpires(_tokenId)) {
            return rentableNFT.userOf(_tokenId);
        }
        return address(0);
    }

    // Admin functions
    function setDefaultInterestRate(uint256 _rate) external onlyOwner {
        defaultInterestRate = _rate;
    }

    function setMaxLoanDuration(uint256 _duration) external onlyOwner {
        maxLoanDuration = _duration;
    }

    function setDefaultGracePeriod(uint256 _period) external onlyOwner {
        defaultGracePeriod = _period;
    }

    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee cannot exceed 10%");
        platformFee = _fee;
    }

    function setFeeAccount(address payable _feeAccount) external onlyOwner {
        feeAccount = _feeAccount;
    }

    function setVPCToken(address _vpcToken) external onlyOwner {
        vpcToken = IERC20(_vpcToken);
    }
}
