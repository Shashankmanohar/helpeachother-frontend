import { Icon } from '@iconify/react';
import { useApi } from '@/hooks/useApi';
import { fmt } from '@/utils/format';
import { useState, useEffect, useCallback } from 'react';

const StatementsView = () => {
  const api = useApi();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/user/transactions');
      setTransactions(data || []);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const getIcon = (category: string, type: string) => {
    if (type === 'debit') return 'solar:arrow-right-up-linear';
    switch (category) {
      case 'referral_join':
      case 'referral_direct':
      case 'referral_level':
        return 'solar:users-group-two-rounded-linear';
      case 'daily_cashback':
        return 'solar:calendar-date-linear';
      case 'withdrawal':
        return 'solar:banknote-2-linear';
      default:
        return 'solar:arrow-left-down-linear';
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-medium text-foreground tracking-tight">Statements</h1>
        <p className="text-sm text-muted-foreground mt-1">Recent financial activity.</p>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-secondary/50">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Transactions</h3>
        </div>
        <div className="divide-y divide-border/50">
          {loading ? (
            <div className="p-12 text-center">
              <Icon icon="svg-spinners:ring-resize" width={24} className="mx-auto text-primary" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground text-xs">No transactions found</div>
          ) : (
            transactions.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full ${tx.type === 'credit' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'} flex items-center justify-center border border-foreground/5`}>
                    <Icon icon={getIcon(tx.category, tx.type)} width={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold tabular-nums tracking-tight ${tx.type === 'credit' ? 'text-success' : 'text-foreground'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{fmt(tx.amount)}
                  </span>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-tighter opacity-50 mt-0.5">{tx.category.replace('_', ' ')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StatementsView;
