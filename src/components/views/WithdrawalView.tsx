import { Icon } from '@iconify/react';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { BusinessPlan } from '@/config/businessPlan';
import { fmt } from '@/utils/format';
import { useState, useEffect, useCallback } from 'react';

const WithdrawalView = () => {
  const { state, dispatch, showToast } = useApp();
  const api = useApi();
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<string>('pending');
  const [loadingKyc, setLoadingKyc] = useState(true);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchKycStatus = useCallback(async () => {
    try {
      const data = await api.get('/api/user/kyc-data');
      setKycStatus(data.kycStatus || 'pending');
    } catch { } finally { setLoadingKyc(false); }
  }, []);

  const fetchWithdrawals = useCallback(async () => {
    try {
      const data = await api.get('/api/user/withdrawals');
      setWithdrawals(data || []);
    } catch { } finally { setLoadingHistory(false); }
  }, []);

  useEffect(() => { 
    fetchKycStatus();
    fetchWithdrawals();
  }, [fetchKycStatus, fetchWithdrawals]);

  const withdraw = async () => {
    const val = parseFloat(amount);
    const min = BusinessPlan.rules_and_compliance.minimum_withdrawal_points;
    const { admin, tds } = BusinessPlan.rules_and_compliance.charges;
    if (isNaN(val) || val < min) return showToast(`Min Withdrawal ₹${min}`, 'error');
    if (val > state.wallet.balance) return showToast('Insufficient Funds', 'error');

    setSubmitting(true);
    try {
      const data = await api.post('/api/user/withdraw', { amount: val });
      showToast(data.message || 'Withdrawal request submitted!');
      dispatch({
        type: 'UPDATE_WALLET',
        payload: { balance: state.wallet.balance - val, totalEarned: state.wallet.totalEarned }
      });
      setAmount('');
      fetchWithdrawals(); // Refresh history
    } catch { } finally { setSubmitting(false); }
  };

  const feeText = `${BusinessPlan.rules_and_compliance.charges.admin + BusinessPlan.rules_and_compliance.charges.tds}% (Admin + TDS)`;

  if (loadingKyc) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icon icon="svg-spinners:ring-resize" width={32} className="text-primary" />
      </div>
    );
  }

  // KYC not submitted — block withdrawal
  if (kycStatus !== 'approved') {
    return (
      <div className="space-y-6 page-enter">
        <div>
          <h1 className="text-2xl font-medium text-foreground tracking-tight">Withdrawal</h1>
          <p className="text-sm text-muted-foreground mt-1">Transfer funds to your bank account.</p>
        </div>
        <div className="max-w-md mx-auto mt-8 text-center bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="h-14 w-14 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="solar:shield-warning-linear" width={28} className="text-warning" />
          </div>
          <h2 className="text-lg font-medium text-foreground">KYC Required</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6 text-center">
            Please complete your KYC verification before making a withdrawal.
          </p>
          <button
            onClick={() => dispatch({ type: 'SET_TAB', tab: 'kyc' })}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-colors click-scale shadow-sm"
          >
            Complete KYC →
          </button>
        </div>
      </div>
    );
  }

  // Autopool requirement for high earners — block withdrawal
  if ((state.wallet.totalEarned || 0) >= 10000 && !state.wallet.hasJoinedAutopool) {
    return (
      <div className="space-y-6 page-enter">
        <div>
          <h1 className="text-2xl font-medium text-foreground tracking-tight">Withdrawal</h1>
          <p className="text-sm text-muted-foreground mt-1">Transfer funds to your bank account.</p>
        </div>
        <div className="max-w-md mx-auto mt-8 text-center bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="solar:layers-bold-duotone" width={28} className="text-primary" />
          </div>
          <h2 className="text-lg font-medium text-foreground">Autopool Required</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">
            You have earned over <span className="text-foreground font-bold font-mono">₹10,000</span>. 
            To continue withdrawing funds, you are now required to join the 
            <span className="text-primary font-bold"> Dream Autopool Club</span>.
          </p>
          <button
            onClick={() => dispatch({ type: 'SET_TAB', tab: 'autopool' })}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-colors click-scale shadow-sm"
          >
            Join Autopool Now →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-medium text-foreground tracking-tight">Withdrawal</h1>
        <p className="text-sm text-muted-foreground mt-1">Transfer funds to your bank account.</p>
      </div>

      <EligibilityCard eligibility={state.wallet.referralEligibility} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Withdrawal Form */}
        <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm">
          <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Enter Amount</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground font-normal text-lg">₹</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Min 500"
              className="w-full bg-secondary border border-border text-foreground text-lg font-normal rounded-lg py-3 pl-8 pr-4 focus:ring-1 focus:ring-ring focus:border-ring outline-none transition-all placeholder:text-muted-foreground/30 focus:bg-card"
            />
          </div>
          <div className="mt-6 p-4 bg-secondary rounded-lg space-y-3 border border-dashed border-border">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground font-normal">Available Balance</span>
              <span className="font-medium text-foreground tabular-nums">₹{fmt(state.wallet.balance)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground font-normal">Processing Fee</span>
              <span className="font-normal text-destructive text-xs">{feeText}</span>
            </div>
          </div>
          <button
            onClick={withdraw}
            disabled={submitting}
            className="w-full mt-6 bg-primary text-primary-foreground font-medium py-3 rounded-lg click-scale hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm text-sm disabled:opacity-50"
          >
            {submitting ? <><Icon icon="svg-spinners:ring-resize" width={18} /> Processing...</> : <>Confirm Withdrawal <Icon icon="solar:arrow-right-linear" width={16} /></>}
          </button>
        </div>

        {/* Withdrawal History */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-secondary/30">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon icon="solar:history-bold-duotone" width={18} className="text-primary" />
              Withdrawal History
            </h2>
          </div>
          <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
            {loadingHistory ? (
              <div className="p-10 text-center"><Icon icon="svg-spinners:ring-resize" width={24} className="mx-auto text-muted-foreground" /></div>
            ) : withdrawals.length === 0 ? (
              <div className="p-10 text-center text-xs text-muted-foreground">No withdrawal requests found.</div>
            ) : (
              withdrawals.map((w: any) => (
                <div key={w._id} className="p-4 hover:bg-secondary/20 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-foreground">₹{fmt(w.amount)}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      w.status === 'approved' ? 'bg-success/10 text-success' : 
                      w.status === 'pending' ? 'bg-warning/10 text-warning' : 
                      'bg-destructive/10 text-destructive'
                    }`}>{w.status}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                    <span>{new Date(w.createdAt).toLocaleDateString()}</span>
                    <span>Net: ₹{fmt(w.netAmount)}</span>
                  </div>
                  {w.adminMessage && (
                    <p className="mt-2 text-[10px] text-destructive italic capitalize">Ref: {w.adminMessage}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EligibilityCard = ({ eligibility }: { eligibility: any }) => {
  if (!eligibility) return null;

  const { isEligible, lifetimeUnlocked, stats, reason } = eligibility;

  return (
    <div className={`mb-6 p-5 rounded-xl border ${isEligible ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isEligible ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
          <Icon icon={lifetimeUnlocked ? "solar:crown-minimalistic-bold" : isEligible ? "solar:check-circle-bold" : "solar:shield-warning-bold"} width={24} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {lifetimeUnlocked ? 'Lifetime Access Unlocked' : isEligible ? 'Withdrawal Eligible' : 'Referral Requirement'}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {lifetimeUnlocked ? 'You have permanent access to withdrawals and E-PINs.' : isEligible ? 'Active monthly requirement met.' : 'Conditions not yet met.'}
          </p>
        </div>
      </div>

      {!lifetimeUnlocked && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <MonthStat label="Month 1" count={stats?.m1 || 0} target={2} />
            <MonthStat label="Month 2" count={stats?.m2 || 0} target={2} />
            <MonthStat label="Month 3" count={stats?.m3 || 0} target={2} />
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 border border-border/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] uppercase font-medium text-muted-foreground">Last 30 Days</span>
              <span className="text-xs font-bold text-foreground">{stats?.recent30Count || 0} / 2</span>
            </div>
            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${isEligible ? 'bg-success' : 'bg-primary'}`} 
                style={{ width: `${Math.min(((stats?.recent30Count || 0) / 2) * 100, 100)}%` }} 
              />
            </div>
          </div>
          {!isEligible && (
            <p className="text-[10px] text-warning font-medium leading-relaxed italic">
              * {reason}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const MonthStat = ({ label, count, target }: { label: string, count: number, target: number }) => (
  <div className="bg-secondary/30 border border-border/50 rounded-lg p-2 text-center">
    <p className="text-[9px] text-muted-foreground uppercase mb-1">{label}</p>
    <p className={`text-sm font-bold ${count >= target ? 'text-success' : 'text-foreground'}`}>
      {count} / {target}
    </p>
  </div>
);

export default WithdrawalView;
