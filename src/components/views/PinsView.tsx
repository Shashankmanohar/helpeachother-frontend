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
        <button
          onClick={buyPin}
          disabled={buying}
          className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-colors click-scale flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <Icon icon={buying ? "svg-spinners:ring-resize" : "solar:cart-large-minimalistic-linear"} width={18} />
          {buying ? 'Purchasing...' : `Buy E-PIN (₹${unitPrice.toLocaleString()})`}
        </button>
      </div>

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

export default PinsView;
