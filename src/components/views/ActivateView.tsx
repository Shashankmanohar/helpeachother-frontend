import { Icon } from '@iconify/react';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { BusinessPlan } from '@/config/businessPlan';
import { useState, useEffect, useCallback } from 'react';

interface EPin {
  _id: string;
  code: string;
  status: string;
}

const ActivateView = () => {
  const { state, showToast, dispatch } = useApp();
  const api = useApi();
  const fee = BusinessPlan.direct_seller_onboarding.activation.activation_fee;

  const [userName, setUserName] = useState('');
  const [selectedPin, setSelectedPin] = useState('');
  const [activating, setActivating] = useState(false);
  const [activePins, setActivePins] = useState<EPin[]>([]);
  const [loadingPins, setLoadingPins] = useState(true);

  const fetchActivePins = useCallback(async () => {
    try {
      const data = await api.get('/api/user/epins');
      setActivePins((data || []).filter((p: EPin) => p.status === 'active'));
    } catch {
      console.error('Failed to load pins');
    } finally {
      setLoadingPins(false);
    }
  }, []);

  useEffect(() => { fetchActivePins(); }, [fetchActivePins]);

  const activate = async () => {
    if (!userName.trim()) return showToast('Enter a username', 'error');
    if (!selectedPin) return showToast('Select an E-PIN', 'error');
    setActivating(true);
    try {
      const data = await api.post('/api/user/activate-user', {
        userName: userName.trim(),
        pinCode: selectedPin
      });
      showToast(data.message || 'User activated!');
      setUserName('');
      setSelectedPin('');
      fetchActivePins(); // Refresh pin list
    } catch (err: any) {
      // useApi handles toast
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="space-y-8 page-enter">
      <div className="max-w-md mx-auto mt-8">
        <div className="text-center mb-8">
          <div className="h-14 w-14 bg-card border border-border text-foreground rounded-xl mx-auto flex items-center justify-center mb-4 shadow-sm">
            <Icon icon="solar:shield-check-linear" width={28} />
          </div>
          <h2 className="text-xl font-medium text-foreground tracking-tight">Activate User</h2>
          <p className="text-sm text-muted-foreground mt-1">Activate another user's membership using your E-PIN.</p>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Username to Activate</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon icon="solar:user-linear" className="text-muted-foreground group-focus-within:text-foreground transition-colors" width={18} />
              </div>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="e.g. rahul123"
                className="block w-full pl-10 pr-3 py-2.5 text-sm bg-secondary border border-border rounded-lg focus:ring-1 focus:ring-ring focus:border-ring focus:bg-card transition-all placeholder-muted-foreground/50 text-foreground font-normal"
              />
            </div>
          </div>

          {/* E-PIN Selection */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Select E-PIN</label>
            {loadingPins ? (
              <div className="flex items-center justify-center py-4">
                <Icon icon="svg-spinners:ring-resize" width={20} className="text-primary" />
              </div>
            ) : activePins.length === 0 ? (
              <div className="bg-secondary/50 rounded-lg border border-border p-4 text-center">
                <p className="text-xs text-muted-foreground">No active E-PINs available</p>
                <button
                  onClick={() => dispatch({ type: 'SET_TAB', tab: 'pins' })}
                  className="text-xs text-primary font-medium mt-1 hover:underline"
                >
                  Buy an E-PIN →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {activePins.map(pin => (
                  <button
                    key={pin._id}
                    onClick={() => setSelectedPin(pin.code)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedPin === pin.code
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm font-medium text-foreground">{pin.code}</span>
                      <div className={`h-4 w-4 rounded-full border ${
                        selectedPin === pin.code
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground/30'
                      } flex items-center justify-center`}>
                        {selectedPin === pin.code && <div className="h-1.5 w-1.5 bg-primary-foreground rounded-full" />}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Value: ₹{fee.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Activate Button */}
          <button
            onClick={activate}
            disabled={activating || !userName.trim() || !selectedPin}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-colors shadow-sm click-scale disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {activating ? (
              <><Icon icon="svg-spinners:ring-resize" width={18} /> Activating...</>
            ) : (
              'Activate User'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivateView;
