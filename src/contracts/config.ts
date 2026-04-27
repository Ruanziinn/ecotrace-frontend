// EcoTrace contracts configuration
// Sepolia testnet — preencha os endereços após o deploy
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

export const ADDRESSES = {
  RecToken:      "0x88c2C67E6C62B0Ae916A2097c4Def0a78e40eC6B",
  PlasticNFT:    "0x27201a02d5Bc5E9A86e5d86624c9221B67a0c630",
  EcoStaking:    "0xDCD97AC634Bd9DCB5a43B160559D73942784963f",
  EcoGovernance: "0xcBc8F0FE30E3927c8B3200DC7651666db28bf37f",
  EcoSale:       "0xC91643d416E3cf5C04d48533b7040A1336aa0586",
};

export const ECOSALE_ADDRESS = ADDRESSES.EcoSale;

export const ECOSALE_ABI = [
  "function buyREC() external payable",
  "function getRECAmount(uint256 ethAmount) view returns (uint256)",
  "function rate() view returns (uint256)",
  "function saleActive() view returns (bool)",
  "function totalETHRaised() view returns (uint256)",
  "function totalRECSold() view returns (uint256)",
  "function contractBalance() view returns (uint256)",
  "event TokensPurchased(address indexed buyer, uint256 ethSent, uint256 recReceived)",
];

export const REC_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
  "function addMinter(address account)",
  "function minters(address) view returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

export const PLASTIC_NFT_ABI = [
  "function mintBale(uint256 weightKg, string uri) returns (uint256)",
  "function retireBale(uint256 tokenId)",
  "function getBale(uint256 tokenId) view returns (tuple(address cooperative, uint256 weightKg, uint256 mintedAt, bool retired))",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function approvedCooperatives(address) view returns (bool)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "event BaleMinted(uint256 indexed tokenId, address indexed cooperative, uint256 weightKg)",
  "event BaleRetired(uint256 indexed tokenId, address indexed company)",
];

export const STAKING_ABI = [
  "function stake(uint256 amount)",
  "function unstake(uint256 amount)",
  "function claimReward()",
  "function pendingReward(address user) view returns (uint256)",
  "function stakes(address) view returns (uint256 amount, uint256 stakedAt, uint256 rewardDebt)",
  "function totalStaked() view returns (uint256)",
  "event Staked(address indexed user, uint256 amount)",
  "event Unstaked(address indexed user, uint256 amount)",
  "event RewardClaimed(address indexed user, uint256 reward)",
];

export const GOVERNANCE_ABI = [
  "function propose(address cooperative, string description, bool isRevoke) returns (uint256)",
  "function vote(uint256 proposalId, bool support)",
  "function execute(uint256 proposalId)",
  "function getState(uint256 proposalId) view returns (uint8)",
  "function proposals(uint256) view returns (address cooperative, string description, uint256 votesFor, uint256 votesAgainst, uint256 deadline, bool executed, bool isRevoke)",
  "function proposalCount() view returns (uint256)",
  "function hasVoted(uint256 proposalId, address voter) view returns (bool)",
  "event ProposalCreated(uint256 indexed id, address indexed cooperative, bool isRevoke)",
  "event Voted(uint256 indexed id, address indexed voter, bool support, uint256 weight)",
  "event ProposalExecuted(uint256 indexed id, bool approved)",
];

export const PROPOSAL_STATE = {
  Active: 0,
  Approved: 1,
  Rejected: 2,
  Executed: 3,
} as const;