import { Icon } from '@iconify/react';
import { useApp } from '@/context/AppContext';
import { BusinessPlan } from '@/config/businessPlan';
import { fmt } from '@/utils/format';
import { useApi } from '@/hooks/useApi';
import { useEffect, useState } from 'react';

const DashboardView = () => {
  const { state, dispatch } = useApp();
  const api = useApi();
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const response = await api.get('/api/user/dashboard');
        if (response) {
          const updatedUser = {
            ...state.user,
            name: response.name || state.user.name,
            userName: response.userName || state.user.userName,
            referralCode: response.referralCode || state.user.referralCode,
            active: response.status === 'active',
          };

          dispatch({
            type: 'UPDATE_WALLET',
            payload: { 
              balance: response.walletBalance || 0, 
              totalEarned: response.totalEarned || 0,
              levelIncome: response.levelIncome || 0,
              activeDirects: response.activeDirects || 0,
              referralEligibility: response.referralEligibility,
              hasJoinedAutopool: response.hasJoinedAutopool
            }
          });

          dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        }
      } catch (err) {
        console.error("Failed to load latest dashboard stats");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
        <div>
          <h1 className="text-2xl font-medium text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, {state.user.name || 'User'}.</p>

        </div>
        <div className="hidden sm:block">
          {state.user.active ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success-light text-success text-xs font-medium border border-success-border/50">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
              </span>
              System Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Main Balance Card */}
      <div
        className="bg-primary rounded-2xl p-6 md:p-8 text-primary-foreground relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] group cursor-pointer"
        onClick={() => dispatch({ type: 'SET_TAB', tab: 'wallet' })}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground opacity-[0.03] rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col justify-between h-full gap-8">
          <div>
            <p className="text-primary-foreground/60 text-xs font-medium uppercase tracking-wider mb-1">Total Balance</p>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight tabular-nums">₹{fmt(state.wallet.balance)}</h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={e => { e.stopPropagation(); dispatch({ type: 'SET_TAB', tab: 'wallet' }); }}
              className="bg-primary-foreground/10 hover:bg-primary-foreground/20 border border-primary-foreground/10 backdrop-blur-sm text-primary-foreground py-2.5 px-4 rounded-lg text-xs font-medium click-scale transition-colors"
            >
              Withdraw
            </button>
            <button
              onClick={e => { e.stopPropagation(); dispatch({ type: 'SET_TAB', tab: 'activate' }); }}
              className="bg-primary-foreground text-primary py-2.5 px-4 rounded-lg text-xs font-medium click-scale hover:opacity-90 transition-colors shadow-sm"
            >
              Activate ID
            </button>
          </div>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon icon="solar:share-circle-bold" width={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Your Referral Link</h3>
            <p className="text-xs text-muted-foreground">Code: <span className="text-primary font-bold uppercase">{state.user.referralCode || 'PENDING'}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs font-mono truncate text-muted-foreground">
            {window.location.origin}/?ref={state.user.referralCode || state.user.userName || '......'}
          </div>
          <button
            onClick={() => {
              const link = `${window.location.origin}/?ref=${state.user.referralCode || state.user.userName}`;
              navigator.clipboard.writeText(link);
              // Fallback alert
              alert('Link copied to clipboard!');
            }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Copy Link
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 stagger-children">
        <StatCard icon="solar:wallet-money-linear" label="Total Income" value={`₹${fmt(state.wallet.totalEarned)}`} />
        <StatCard icon="solar:graph-up-linear" label="Level Income" value={`₹${fmt(state.wallet.levelIncome || 0)}`} valueClass="text-success" />
        <StatCard icon="solar:users-group-rounded-linear" label="Active Directs" value={String(state.wallet.activeDirects || 0)} />
        <StatCard icon="solar:users-group-rounded-bold" label="Total Team" value={String(state.team.total)} onClick={() => dispatch({ type: 'SET_TAB', tab: 'team' })} />
      </div>

      {/* Income Streams */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-foreground mb-3">Available Income Streams</h3>
        <div className="flex flex-wrap gap-2">
          {BusinessPlan.income_system_overview.income_streams.map(s => (
            <span key={s} className="px-2.5 py-1 bg-secondary text-foreground/80 text-xs font-medium rounded border border-border">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, valueClass, onClick }: {
  icon: string; label: string; value: string; valueClass?: string; onClick?: () => void;
}) => (
  <div
    className={`bg-card p-5 rounded-xl border border-border shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)] card-hover group ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="h-8 w-8 rounded-lg bg-secondary border border-border text-muted-foreground flex items-center justify-center">
        <Icon icon={icon} width={16} />
      </div>
    </div>
    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
    <p className={`text-xl font-medium tracking-tight mt-1 tabular-nums ${valueClass || 'text-foreground'}`}>{value}</p>
  </div>
);

export default DashboardView;
