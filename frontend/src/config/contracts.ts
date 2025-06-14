// Contract addresses (will be updated after deployment)
export const CONTRACTS = {
  SQUAD_WALLET_FACTORY: import.meta.env.VITE_SQUAD_WALLET_FACTORY || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  GAME_MANAGER: import.meta.env.VITE_GAME_MANAGER_CONTRACT || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  XP_BADGES: import.meta.env.VITE_XP_BADGES_CONTRACT || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
} as const;
