// Empty initial data - no demo data
export interface User {
  id: string;
  username: string;
  email: string;
  status: string;
  kycStatus: string;
  walletBalance: number;
  totalEarned: number;
  directCount: number;
  teamCount: number;
  activationStatus: string;
  marriageClaim: string;
  joinDate: string;
  blocked: boolean;
}

export interface Withdrawal {
  id: string;
  userId: string;
  username: string;
  amount: number;
  fee: number;
  netAmount: number;
  bankName: string;
  accountNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetUser: string;
  timestamp: string;
  ipAddress: string;
}

export interface Pin {
  id: string;
  code: string;
  status: 'available' | 'used' | 'deactivated';
  assignedTo: string;
  price: number;
  adminCharge: number;
  totalPrice: number;
  createdAt: string;
}

export interface AutopoolTier {
  tier: string;
  entryPrice: number;
  reward: number;
  members: string[];
  completed: string[];
  active: string[];
  frozen: boolean;
}

export interface KYCRecord {
  userId: string;
  username: string;
  aadhaarNumber: string;
  aadhaarName: string;
  panNumber?: string;
  panName?: string;
  bankAccountNumber: string;
  bankIFSC: string;
  bankName: string;
  accountHolderName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export const mockUsers: User[] = [];
export const mockWithdrawals: Withdrawal[] = [];
export const mockTransactions: Transaction[] = [];
export const mockAuditLogs: AuditLog[] = [];

export const PIN_BASE_PRICE = 1199;
export const PIN_ADMIN_CHARGE_PERCENT = 15;
export const PIN_TOTAL_PRICE = Math.round(PIN_BASE_PRICE * (1 + PIN_ADMIN_CHARGE_PERCENT / 100)); // ₹1379

export const dashboardMetrics = {
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  totalWalletCirculation: 0,
  totalEarningsDistributed: 0,
  pendingWithdrawals: 0,
  totalAutopoolCollections: 0,
  totalPayoutsProcessed: 0,
  marriageClaimsPending: 0,
};

export const earningsChartData: { month: string; earnings: number; withdrawals: number }[] = [];

export const autopoolTiers: AutopoolTier[] = [
  { tier: '₹2,500', entryPrice: 2500, reward: 5000, members: [], completed: [], active: [], frozen: false },
  { tier: '₹5,000', entryPrice: 5000, reward: 12000, members: [], completed: [], active: [], frozen: false },
  { tier: '₹7,500', entryPrice: 7500, reward: 25000, members: [], completed: [], active: [], frozen: false },
  { tier: '₹10,000', entryPrice: 10000, reward: 50000, members: [], completed: [], active: [], frozen: true },
];

export const kycRecords: KYCRecord[] = [];

