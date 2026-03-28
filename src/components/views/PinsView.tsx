import { Icon } from '@iconify/react';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { BusinessPlan } from '@/config/businessPlan';
import { useState, useEffect, useCallback } from 'react';

interface Pin {
  _id: string;
  code: string;
  status: string;
  value: number;
  usedBy?: { userName: string; name: string } | null;
  usedAt?: string;
  createdAt: string;
}

const PinsView = () => {
  const { state, showToast, dispatch } = useApp();
  const api = useApi();
  const unitPrice = BusinessPlan.direct_seller_onboarding.activation.activation_fee;

  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  const fetchPins = useCallback(async () => {
    try {
      const data = await api.get('/api/user/epins');
      setPins(data || []);
    } catch {
      console.error('Failed to load pins');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPins(); }, [fetchPins]);

  const buyPin = async () => {
    if (buying) return;
    setBuying(true);
    try {
      const data = await api.post('/api/user/buy-epin', {});
      showToast(data.message || 'E-PIN purchased!');
      if (data.walletBalance !== undefined) {
        dispatch({ type: 'UPDATE_WALLET', payload: { balance: data.walletBalance, totalEarned: state.wallet.totalEarned } });
      }
      fetchPins();
    } catch (err: any) {
      // error toast handled by useApi
    } finally {
      setBuying(false);
    }
  };

  const activePins = pins.filter(p => p.status === 'active');
  const usedPins = pins.filter(p => p.status === 'used');

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium text-foreground tracking-tight">E-PIN Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Buy E-PINs to activate users. Each costs ₹{unitPrice.toLocaleString()}.</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <button
            onClick={buyPin}
            disabled={buying || !state.wallet.referralEligibility?.isEligible || (state.wallet.totalEarned || 0) < 10000}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-colors click-scale flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Icon icon={buying ? "svg-spinners:ring-resize" : "solar:cart-large-minimalistic-linear"} width={18} />
            {buying ? 'Purchasing...' : `Buy E-PIN (₹${unitPrice.toLocaleString()})`}
          </button>
          
          {(state.wallet.totalEarned || 0) < 10000 && (
            <p className="text-[10px] text-warning font-medium flex items-center gap-1">
              <Icon icon="solar:info-circle-bold" width={12} />
              Requires ₹10,000 total earnings
            </p>
          )}
        </div>
      </div>

      <EligibilityCard eligibility={state.wallet.referralEligibility} />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Available PINs</p>
          <p className="text-2xl font-medium text-success mt-1 tabular-nums">{activePins.length}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Used PINs</p>
          <p className="text-2xl font-medium text-muted-foreground mt-1 tabular-nums">{usedPins.length}</p>
        </div>
      </div>

      {/* PIN List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Icon icon="svg-spinners:ring-resize" width={32} className="text-primary" />
        </div>
      ) : pins.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Icon icon="solar:ticket-linear" width={40} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No E-PINs yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Buy an E-PIN to activate a user</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
          {pins.map((p) => (
            <div key={p._id} className="bg-card p-4 rounded-xl border border-border shadow-sm card-hover">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${
                    p.status === 'active' 
                      ? 'bg-success-light text-success border-success-border/30' 
                      : 'bg-secondary text-muted-foreground border-border'
                  }`}>
                    <Icon icon="solar:ticket-linear" width={16} />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-medium text-foreground tracking-tight">{p.code}</p>
                    <p className={`text-[10px] font-medium uppercase tracking-wide ${
                      p.status === 'active' ? 'text-success' : 'text-muted-foreground'
                    }`}>
                      {p.status}
                    </p>
                  </div>
                </div>
                {p.status === 'active' && (
                  <button
                    onClick={() => { navigator.clipboard.writeText(p.code); showToast('PIN copied!'); }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon icon="solar:copy-linear" width={16} />
                  </button>
                )}
              </div>
              {p.status === 'used' && p.usedBy && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-[10px] text-muted-foreground">
                    Used for: <span className="text-foreground font-medium">@{p.usedBy.userName}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {p.usedAt ? new Date(p.usedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
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
            {lifetimeUnlocked ? 'Lifetime Access Unlocked' : isEligible ? 'E-PIN Eligible' : 'Referral Requirement'}
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

export default PinsView;
