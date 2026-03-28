import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { BusinessPlan } from '@/config/businessPlan';

// Types
export interface Transaction {
  type: 'credit' | 'debit';
  amount: number;
  desc: string;
  date: string;
  tag?: string;
}

export interface Pin {
  code: string;
  status: 'active' | 'used';
}

export interface PoolEntry {
  sequence: number;
  membersAfterMe: number;
  levelCounts: { l1: number; l2: number; l3: number; l4: number };
  isCompleted: boolean;
  currentLevel: number;
}

export interface PoolState {
  joined: boolean;
  entries: PoolEntry[];
}

export interface CashbackState {
  lastCreditDate: string | null;
  monthlyCredits: number;
  currentMonth: number; // month index when tracking started
  monthsCompleted: number;
  totalEarned: number;
  history: { date: string; amount: number }[];
}

export interface AppState {
  user: { id: string; userName: string; name: string; kyc: boolean; active: boolean; marriageClaimed: boolean; referralCode?: string };
  wallet: { 
    balance: number; 
    totalEarned: number; 
    levelIncome: number; 
    activeDirects: number;
    referralEligibility?: {
      isEligible: boolean;
      lifetimeUnlocked: boolean;
      reason?: string;
      stats?: { m1: number; m2: number; m3: number; recent30Count: number };
    };
    hasJoinedAutopool?: boolean;
  };
  team: { direct: number; total: number; active: number };
  transactions: Transaction[];
  pins: Pin[];
  autopool: { activePool: number; pools: Record<number, PoolState> };
  cashback: CashbackState;
  activeTab: string;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
}

// Actions
type Action =
  | { type: 'SET_TAB'; tab: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'CLOSE_SIDEBAR' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'ADD_TX'; tx: Transaction; balanceChange: number; earnedChange: number }
  | { type: 'SET_KYC'; value: boolean }
  | { type: 'SET_ACTIVE'; value: boolean }
  | { type: 'ADD_PINS'; pins: Pin[] }
  | { type: 'SET_ACTIVE_POOL'; pool: number }
  | { type: 'JOIN_POOL'; pool: number }
  | { type: 'SIMULATE_FILL'; pool: number; levelCompleted: boolean; income: number; newLevel: number }
  | { type: 'CLAIM_MARRIAGE' }
  | { type: 'CREDIT_CASHBACK'; amount: number; date: string }
  | { type: 'UPDATE_USER'; payload: any }
  | { type: 'UPDATE_WALLET'; payload: { balance: number; totalEarned: number; levelIncome?: number; activeDirects?: number; referralEligibility?: any; hasJoinedAutopool?: boolean } }
  | { type: 'RESET' };

const generateInitialPools = (): Record<number, PoolState> => {
  const pools: Record<number, PoolState> = {};
  BusinessPlan.dream_autopool_club.autopool_types.forEach(p => {
    pools[p.entry] = { joined: false, entries: [] };
  });
  return pools;
};

const defaultState: AppState = {
  user: { id: '', userName: '', name: '', kyc: false, active: false, marriageClaimed: false },
  wallet: { balance: 0, totalEarned: 0, levelIncome: 0, activeDirects: 0 },
  team: { direct: 0, total: 0, active: 0 },
  transactions: [],
  pins: [],
  autopool: { activePool: 2500, pools: generateInitialPools() },
  cashback: {
    lastCreditDate: null,
    monthlyCredits: 0,
    currentMonth: new Date().getMonth(),
    monthsCompleted: 0,
    totalEarned: 0,
    history: [],
  },
  activeTab: 'dashboard',
  sidebarOpen: false,
  theme: 'light',
};


const STORAGE_KEY = 'HEO_PVT_STATE_PROD_V3'; // Increment key to force clear
const OLD_STORAGE_KEY = 'HEO_STATE_PROD';

const loadState = (): AppState => {
  try {
    // Force clear old legacy key if it exists
    localStorage.removeItem(OLD_STORAGE_KEY);

    const saved = localStorage.getItem(STORAGE_KEY);
    const userJson = localStorage.getItem('heo_user');
    let user = defaultState.user;

    if (userJson) {
      try {
        const parsedUser = JSON.parse(userJson);
        user = {
          ...user,
          id: parsedUser.id || parsedUser._id,
          userName: parsedUser.userName,
          name: parsedUser.name,
          active: parsedUser.status === 'active',
          kyc: parsedUser.kycStatus === 'completed',
          referralCode: parsedUser.referralCode || parsedUser.userName
        };
      } catch (e) { }
    }

    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.user?.name === 'Rahul Kumar' || parsed.wallet?.balance === 5000) {
        localStorage.removeItem(STORAGE_KEY);
        return { ...defaultState, user };
      }
      return { ...defaultState, ...parsed, user: { ...parsed.user, ...user }, activeTab: 'dashboard', sidebarOpen: false };
    }
    return { ...defaultState, user };
  } catch { }
  return defaultState;
};


const saveState = (state: AppState) => {
  const { activeTab, sidebarOpen, ...persist } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab, sidebarOpen: false };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'CLOSE_SIDEBAR':
      return { ...state, sidebarOpen: false };
    case 'TOGGLE_THEME': {
      const newTheme: 'light' | 'dark' = state.theme === 'light' ? 'dark' : 'light';
      const newState: AppState = { ...state, theme: newTheme };
      saveState(newState);
      return newState;
    }
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'UPDATE_WALLET':
      return { ...state, wallet: { ...state.wallet, ...action.payload } };
    case 'ADD_TX': {
      const newState = {
        ...state,
        transactions: [action.tx, ...state.transactions],
        wallet: {
          ...state.wallet,
          balance: state.wallet.balance + action.balanceChange,
          totalEarned: state.wallet.totalEarned + action.earnedChange,
        },
      };
      saveState(newState);
      return newState;
    }
    case 'SET_KYC': {
      const newState = { ...state, user: { ...state.user, kyc: action.value } };
      saveState(newState);
      return newState;
    }
    case 'SET_ACTIVE': {
      const newState = { ...state, user: { ...state.user, active: action.value } };
      saveState(newState);
      return newState;
    }
    case 'ADD_PINS': {
      const newState = { ...state, pins: [...action.pins, ...state.pins] };
      saveState(newState);
      return newState;
    }
    case 'SET_ACTIVE_POOL': {
      return { ...state, autopool: { ...state.autopool, activePool: action.pool } };
    }
    case 'JOIN_POOL': {
      const newPools = { ...state.autopool.pools };
      newPools[action.pool] = { ...newPools[action.pool], joined: true };
      const newState = { ...state, autopool: { ...state.autopool, pools: newPools } };
      saveState(newState);
      return newState;
    }
    case 'SIMULATE_FILL': {
      // NOTE: Simulation is deprecated with arrays, relying on API state
      return state;
    }
    case 'CLAIM_MARRIAGE': {
      const newState = { ...state, user: { ...state.user, marriageClaimed: true } };
      saveState(newState);
      return newState;
    }
    case 'CREDIT_CASHBACK': {
      const now = new Date();
      const currentMonth = now.getMonth();
      let { monthlyCredits, monthsCompleted, currentMonth: trackMonth } = state.cashback;

      if (currentMonth !== trackMonth) {
        if (monthlyCredits > 0) monthsCompleted++;
        monthlyCredits = 0;
        trackMonth = currentMonth;
      }

      const newCashback: CashbackState = {
        lastCreditDate: action.date,
        monthlyCredits: monthlyCredits + 1,
        currentMonth: trackMonth,
        monthsCompleted,
        totalEarned: state.cashback.totalEarned + action.amount,
        history: [{ date: action.date, amount: action.amount }, ...state.cashback.history],
      };
      const newState = { ...state, cashback: newCashback };
      saveState(newState);
      return newState;
    }
    case 'RESET': {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('heo_token');
      localStorage.removeItem('heo_user');
      localStorage.removeItem('heo_admin_token');
      localStorage.removeItem('heo_admin_user');
      return { ...defaultState, transactions: [] };
    }
    default:
      return state;
  }
}

// Toast system
export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error') => void;
  addTx: (type: 'credit' | 'debit', amount: number, desc: string, tag?: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

let toastId = 0;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3300);
  }, []);

  const addTx = useCallback((type: 'credit' | 'debit', amount: number, desc: string, tag?: string) => {
    const tx: Transaction = { type, amount, desc, date: new Date().toISOString(), tag };
    dispatch({
      type: 'ADD_TX',
      tx,
      balanceChange: amount,
      earnedChange: amount > 0 ? amount : 0,
    });
  }, []);

  // Apply theme class to document
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);


  return (
    <AppContext.Provider value={{ state, dispatch, toasts, showToast, addTx }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
