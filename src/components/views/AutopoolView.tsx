import { Icon } from '@iconify/react';
import { useApp } from '@/context/AppContext';
import { BusinessPlan } from '@/config/businessPlan';
import { useApi } from '@/hooks/useApi';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AutopoolView = () => {
  const { state, dispatch, showToast } = useApp();
  const api = useApi();
  const [poolsData, setPoolsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pid = state.autopool.activePool;

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/user/autopool-status');
      setPoolsData(data);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const poolState = poolsData?.[pid] || { joined: false, levelCounts: { l1: 0, l2: 0, l3: 0, l4: 0 }, isCompleted: false };
  const poolConfig = BusinessPlan.dream_autopool_club.autopool_types.find(p => p.entry === pid)!;
  const totalPotential = poolConfig.levels.reduce((acc, l) => acc + l.income, 0);

  const joinPool = async () => {
    try {
      setJoining(true);
      setShowConfirm(false);
      await api.post('/api/user/join-autopool', { poolType: pid });
      showToast(`Joined ₹${pid} Pool Successfully`);
      fetchStatus();
      // Refresh wallet balance
      const userData = await api.get('/api/user/profile');
      if (userData) {
        dispatch({ type: 'UPDATE_WALLET', payload: { balance: userData.walletBalance, totalEarned: userData.totalEarned } });
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error joining pool', 'error');
    } finally {
      setJoining(false);
    }
  };

  const isCompleted = poolState.isCompleted;

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-medium text-foreground tracking-tight">Dream Autopool Club</h2>
          <p className="text-sm text-muted-foreground mt-1">Global auto-filling system. No mandatory conditions to enter.</p>
        </div>
        <div className="flex flex-wrap gap-1 bg-card border border-border p-1 rounded-lg">
          {BusinessPlan.dream_autopool_club.autopool_types.map(p => (
            <button
              key={p.entry}
              onClick={() => dispatch({ type: 'SET_ACTIVE_POOL', pool: p.entry })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${pid === p.entry ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary'
                }`}
            >
              ₹{p.entry}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 md:p-8 shadow-sm relative overflow-hidden">
        {loading && !poolsData ? (
          <div className="flex items-center justify-center p-20">
            <Icon icon="svg-spinners:ring-resize" width={32} className="text-primary" />
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 relative z-10 gap-4">
              <div>
                <h2 className="text-lg font-medium text-foreground tracking-tight">Autopool ₹{pid}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Active Entries: {poolState.entries?.length || 0}
                </p>
              </div>
              <div className="flex flex-col gap-3 items-end">
                <div className="text-right border-t md:border-t-0 border-border/50 pt-4 md:pt-0 w-full md:w-auto">
                  <p className="text-xs uppercase font-medium text-muted-foreground">Potential Payout Per Entry</p>
                  <p className="text-2xl font-medium text-success tracking-tight">₹{totalPotential.toLocaleString()}</p>
                </div>
                {/* Always allow joining for more entries */}
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={joining}
                  className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-sm click-scale flex items-center gap-2 max-w-max"
                >
                  {joining && <Icon icon="svg-spinners:ring-resize" width={16} />}
                  Join Again
                </button>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              {poolState.entries && poolState.entries.length > 0 ? (
                poolState.entries.map((entry: any, entryIndex: number) => {
                  const isCompleted = entry.isCompleted;
                  
                  return (
                    <div key={entryIndex} className="bg-background/50 rounded-xl p-5 border border-border/60">
                      <div className="flex justify-between items-center mb-4">
                         <div className="flex items-center gap-2">
                           <h3 className="text-sm font-semibold text-foreground">Entry #{entryIndex + 1}</h3>
                           <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Seq: {entry.sequence}</span>
                         </div>
                         <div className="text-xs font-medium">
                           {isCompleted ? (
                             <span className="text-success flex items-center gap-1"><Icon icon="solar:cup-star-linear" width={14} /> Completed</span>
                           ) : (
                             <span className="text-primary flex items-center gap-1"><Icon icon="solar:round-alt-arrow-right-linear" width={14} /> Active (Level {entry.currentLevel + 1})</span>
                           )}
                         </div>
                      </div>

                      <div className="space-y-4">
                        {poolConfig.levels.map((lvl, index) => {
                          const levelKey = `l${index + 1}`;
                          const currentMembers = entry.levelCounts?.[levelKey] || 0;
                          const pct = Math.min((currentMembers / lvl.team_size) * 100, 100);

                          return (
                            <div key={index}>
                              <div className="flex justify-between text-xs font-medium mb-1.5">
                                <span className="text-foreground">Level {index + 1} <span className="text-muted-foreground font-normal ml-1">Reward: ₹{lvl.income.toLocaleString()}</span></span>
                                <span className="text-muted-foreground tabular-nums">{currentMembers}/{lvl.team_size}</span>
                              </div>
                              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10">
                   <p className="text-sm text-muted-foreground mb-4">You haven't joined this pool yet.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-card rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-border text-center"
            >
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <Icon icon="solar:wallet-money-bold-duotone" width={32} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Join Autopool ₹{pid}?</h3>
              <p className="text-sm text-muted-foreground mb-8">
                Confirm your participation in the ₹{pid} pool. This amount will be deducted from your wallet balance.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="py-2.5 px-4 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={joinPool}
                  className="py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20 text-sm"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AutopoolView;
