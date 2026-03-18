import { Icon } from '@iconify/react';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { BusinessPlan } from '@/config/businessPlan';
import { useEffect, useState, useMemo } from 'react';
import { fmt } from '@/utils/format';

type Transaction = {
  _id: string;
  amount: number;
  type: string;
  category: string;
  description: string;
  createdAt: string;
};

const LevelIncomeView = () => {
  const { state } = useApp();
  const api = useApi();
  const { level_income_structure } = BusinessPlan;

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await api.get('/api/user/transactions');
        setTransactions(data || []);
      } catch (error) {
        console.error('Failed to load transactions for level income');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter only level income transactions
  const levelTxs = useMemo(() => {
    return transactions.filter(tx => tx.category === 'referral_level' && tx.type === 'credit');
  }, [transactions]);

  // Total level income earned
  const totalLevelIncome = useMemo(() => {
    return levelTxs.reduce((sum, tx) => sum + tx.amount, 0);
  }, [levelTxs]);

  // Today's level income
  const todaysLevelIncome = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return levelTxs
      .filter(tx => new Date(tx.createdAt).toISOString().split('T')[0] === today)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [levelTxs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icon icon="svg-spinners:ring-resize" width={32} className="text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-medium text-foreground tracking-tight">Level Income</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Earnings generated when your downline earns daily cashback or activates their ID.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Level Earned</p>
            <h3 className="text-3xl font-medium text-success tabular-nums">₹{fmt(totalLevelIncome)}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center text-success">
            <Icon icon="solar:wallet-money-bold" width={24} />
          </div>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Today's Level Income</p>
            <h3 className="text-3xl font-medium text-foreground tabular-nums">₹{fmt(todaysLevelIncome)}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon icon="solar:calendar-date-bold" width={24} />
          </div>
        </div>
      </div>

      {/* Level Income Structure Card */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border bg-secondary/30">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Icon icon="solar:graph-new-linear" width={18} className="text-primary" />
            Daily Level Income Structure
          </h3>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
            Earnings when your referrals get daily cashback
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-secondary/50 text-muted-foreground uppercase tracking-wider font-medium border-b border-border">
                <th className="px-5 py-3 font-medium">Level</th>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium text-right">Daily Bonus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {level_income_structure.levels.map((level) => (
                <tr key={level.level} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">Level {level.level}</td>
                  <td className="px-5 py-3 text-muted-foreground">{level.title}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="font-semibold text-success">₹{level.points}</span>
                    <span className="text-[10px] ml-1 text-muted-foreground">/day</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-secondary/10 border-t border-border">
          <p className="text-[10px] text-center text-muted-foreground italic">
            * Referrals must be active and receiving their daily cashback for you to earn level income.
          </p>
        </div>
      </div>

      {/* Recent Level Credit History */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border bg-secondary/30">
          <h3 className="text-sm font-semibold text-foreground">Recent Level Credits</h3>
        </div>
        
        {levelTxs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No level income recorded yet. Build your team to start earning!
          </div>
        ) : (
          <div className="divide-y divide-border">
            {levelTxs.slice(0, 10).map((tx) => (
              <div key={tx._id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success flex-shrink-0">
                    <Icon icon="solar:arrow-right-down-bold" width={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-success">+₹{fmt(tx.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default LevelIncomeView;
