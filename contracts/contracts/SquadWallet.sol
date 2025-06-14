// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SquadWallet
 * @dev Multi-signature wallet for group management with proposal/voting mechanism
 * @notice Enables groups to manage shared funds with democratic decision making
 */
contract SquadWallet is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Events
    event MemberAdded(address indexed member, string name);
    event MemberRemoved(address indexed member);
    event Deposit(address indexed member, uint256 amount, address token);
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event ProposalVoted(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId, bool success);
    event Withdrawal(address indexed to, uint256 amount, address token);

    // Structs
    struct Member {
        string name;
        uint256 totalDeposited;
        uint256 xpPoints;
        bool isActive;
        uint256 joinedAt;
    }

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        address target;
        uint256 value;
        bytes data;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    // State variables
    mapping(address => Member) public members;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(address => uint256)) public tokenBalances; // member => token => balance
    
    address[] public memberList;
    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant MIN_VOTES_REQUIRED = 2; // Minimum votes needed to execute
    
    string public walletName;
    uint256 public totalMembers;
    uint256 public createdAt;

    // Modifiers
    modifier onlyMember() {
        require(members[msg.sender].isActive, "Not an active member");
        _;
    }

    modifier proposalExists(uint256 proposalId) {
        require(proposalId < proposalCount, "Proposal does not exist");
        _;
    }

    modifier proposalNotExecuted(uint256 proposalId) {
        require(!proposals[proposalId].executed, "Proposal already executed");
        _;
    }

    modifier withinVotingPeriod(uint256 proposalId) {
        require(block.timestamp <= proposals[proposalId].deadline, "Voting period ended");
        _;
    }

    /**
     * @dev Constructor to initialize the squad wallet
     * @param _walletName Name of the squad wallet
     * @param _initialMembers Array of initial member addresses
     * @param _memberNames Array of initial member names
     */
    constructor(
        string memory _walletName,
        address[] memory _initialMembers,
        string[] memory _memberNames
    ) Ownable(msg.sender) {
        require(_initialMembers.length > 0, "Must have at least one member");
        require(_initialMembers.length == _memberNames.length, "Members and names length mismatch");
        
        walletName = _walletName;
        createdAt = block.timestamp;
        
        // Add initial members
        for (uint256 i = 0; i < _initialMembers.length; i++) {
            _addMember(_initialMembers[i], _memberNames[i]);
        }
        
        // Transfer ownership to the first member
        _transferOwnership(_initialMembers[0]);
    }

    /**
     * @dev Add a new member to the squad
     * @param member Address of the new member
     * @param name Name of the new member
     */
    function addMember(address member, string memory name) external onlyOwner {
        _addMember(member, name);
    }

    /**
     * @dev Internal function to add a member
     */
    function _addMember(address member, string memory name) internal {
        require(member != address(0), "Invalid member address");
        require(!members[member].isActive, "Member already exists");
        require(bytes(name).length > 0, "Name cannot be empty");

        members[member] = Member({
            name: name,
            totalDeposited: 0,
            xpPoints: 0,
            isActive: true,
            joinedAt: block.timestamp
        });

        memberList.push(member);
        totalMembers++;

        emit MemberAdded(member, name);
    }

    /**
     * @dev Deposit ETH to the squad wallet
     */
    function depositETH() external payable onlyMember {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        members[msg.sender].totalDeposited += msg.value;
        tokenBalances[msg.sender][address(0)] += msg.value; // address(0) represents ETH
        
        // Award XP for deposit (1 XP per 0.001 ETH)
        uint256 xpEarned = msg.value / 1e15;
        members[msg.sender].xpPoints += xpEarned;

        emit Deposit(msg.sender, msg.value, address(0));
    }

    /**
     * @dev Deposit ERC20 tokens to the squad wallet
     * @param token Address of the ERC20 token
     * @param amount Amount of tokens to deposit
     */
    function depositToken(address token, uint256 amount) external onlyMember {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Deposit amount must be greater than 0");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        tokenBalances[msg.sender][token] += amount;
        
        // Award XP for token deposit (simplified: 1 XP per token unit)
        members[msg.sender].xpPoints += amount / 1e18;

        emit Deposit(msg.sender, amount, token);
    }

    /**
     * @dev Create a new proposal for squad actions
     * @param description Description of the proposal
     * @param target Target contract address (if any)
     * @param value ETH value to send (if any)
     * @param data Encoded function call data (if any)
     */
    function createProposal(
        string memory description,
        address target,
        uint256 value,
        bytes memory data
    ) external onlyMember returns (uint256) {
        require(bytes(description).length > 0, "Description cannot be empty");

        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.description = description;
        proposal.target = target;
        proposal.value = value;
        proposal.data = data;
        proposal.deadline = block.timestamp + VOTING_PERIOD;
        proposal.executed = false;

        emit ProposalCreated(proposalId, msg.sender, description);
        return proposalId;
    }

    /**
     * @dev Vote on a proposal
     * @param proposalId ID of the proposal
     * @param support True for yes, false for no
     */
    function vote(uint256 proposalId, bool support) 
        external 
        onlyMember 
        proposalExists(proposalId) 
        proposalNotExecuted(proposalId) 
        withinVotingPeriod(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.hasVoted[msg.sender], "Already voted");

        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }

        // Award XP for voting
        members[msg.sender].xpPoints += 10;

        emit ProposalVoted(proposalId, msg.sender, support);
    }

    /**
     * @dev Execute a proposal if it has enough votes
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) 
        external 
        proposalExists(proposalId) 
        proposalNotExecuted(proposalId) 
        nonReentrant 
    {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.deadline, "Voting period not ended");
        require(proposal.votesFor >= MIN_VOTES_REQUIRED, "Not enough votes");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal rejected");

        proposal.executed = true;

        bool success = false;
        if (proposal.target != address(0)) {
            (success, ) = proposal.target.call{value: proposal.value}(proposal.data);
        } else if (proposal.value > 0) {
            // Simple ETH transfer
            (success, ) = payable(proposal.proposer).call{value: proposal.value}("");
        } else {
            success = true; // For proposals that don't require execution
        }

        emit ProposalExecuted(proposalId, success);
    }

    /**
     * @dev Get member information
     * @param member Address of the member
     */
    function getMember(address member) external view returns (
        string memory name,
        uint256 totalDeposited,
        uint256 xpPoints,
        bool isActive,
        uint256 joinedAt
    ) {
        Member memory m = members[member];
        return (m.name, m.totalDeposited, m.xpPoints, m.isActive, m.joinedAt);
    }

    /**
     * @dev Get all members
     */
    function getAllMembers() external view returns (address[] memory) {
        return memberList;
    }

    /**
     * @dev Get proposal details
     * @param proposalId ID of the proposal
     */
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory description,
        address target,
        uint256 value,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 deadline,
        bool executed
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.description,
            proposal.target,
            proposal.value,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.deadline,
            proposal.executed
        );
    }

    /**
     * @dev Get contract balance for a specific token
     * @param token Token address (address(0) for ETH)
     */
    function getBalance(address token) external view returns (uint256) {
        if (token == address(0)) {
            return address(this).balance;
        } else {
            return IERC20(token).balanceOf(address(this));
        }
    }

    /**
     * @dev Emergency withdrawal function (only owner)
     * @param token Token address (address(0) for ETH)
     * @param amount Amount to withdraw
     * @param to Recipient address
     */
    function emergencyWithdraw(address token, uint256 amount, address to) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        
        if (token == address(0)) {
            require(address(this).balance >= amount, "Insufficient ETH balance");
            (bool success, ) = payable(to).call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }

        emit Withdrawal(to, amount, token);
    }

    /**
     * @dev Receive function to accept ETH deposits
     */
    receive() external payable {
        if (members[msg.sender].isActive) {
            members[msg.sender].totalDeposited += msg.value;
            tokenBalances[msg.sender][address(0)] += msg.value;
            
            uint256 xpEarned = msg.value / 1e15;
            members[msg.sender].xpPoints += xpEarned;

            emit Deposit(msg.sender, msg.value, address(0));
        }
    }
}
