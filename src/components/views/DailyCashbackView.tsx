import { Icon } from '@iconify/react';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { BusinessPlan } from '@/config/businessPlan';
import { useEffect, useState, useCallback } from 'react';
import { fmt } from '@/utils/format';

const DailyCashbackView = () => {
  const { state, dispatch, showToast } = useApp();
  const api = useApi();
  const { daily_cashback, level_income_structure } = BusinessPlan;

  const [loading, setLoading] = useState(true);
  const [cashbackData, setCashbackData] = useState({
    lastCreditDate: '',
    monthlyCredits: 0,
    monthsCompleted: 0,
    totalEarned: 0,
    active: false,
  });

  const today = new Date().toISOString().split('T')[0];
  const alreadyCredited = cashbackData.lastCreditDate === today;

  const canCredit = cashbackData.active && !alreadyCredited &&
    cashbackData.monthlyCredits < daily_cashback.max_days_per_month &&
    cashbackData.monthsCompleted < daily_cashback.valid_months;
  const isExpired = cashbackData.monthsCompleted >= daily_cashback.valid_months;
  const monthlyMaxReached = cashbackData.monthlyCredits >= daily_cashback.max_days_per_month;

  const fetchStatus = useCallback(async () => {
    try {
      const data = await api.get('/api/user/cashback-status');
      setCashbackData(data);
    } catch {
      console.error('Failed to load cashback status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // Status message for automatic credit
  const getStatusMessage = () => {
    if (!cashbackData.active) return 'Activate ID First';
    if (isExpired) return 'Cashback Period Ended';
    if (monthlyMaxReached) return 'Monthly Limit Reached';
    if (alreadyCredited) return 'Automatically Credited Today';
    return 'Credits Automatically Tomorrow';
  };

  // Countdown timer
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    if (!alreadyCredited) return;
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [alreadyCredited]);

  const progressPct = (cashbackData.monthlyCredits / daily_cashback.max_days_per_month) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

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
        <h1 className="text-2xl font-medium text-foreground tracking-tight">Daily Cashback</h1>
        <p className="text-sm text-muted-foreground mt-1">Earn ₹{daily_cashback.daily_amount} daily for up to {daily_cashback.max_days_per_month} days/month, {daily_cashback.valid_months} months.</p>
      </div>

      {/* Main Card */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg width="120" height="120" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke="hsl(var(--success))"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="progress-ring-circle"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-medium text-foreground tabular-nums">{cashbackData.monthlyCredits}</span>
              <span className="text-[10px] text-muted-foreground">/ {daily_cashback.max_days_per_month} days</span>
            </div>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary p-4 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Today's Cashback</p>
                <p className="text-xl font-medium text-foreground mt-1 tabular-nums">₹{daily_cashback.daily_amount}</p>
              </div>
              <div className="bg-secondary p-4 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Earned</p>
                <p className="text-xl font-medium text-success mt-1 tabular-nums">₹{fmt(cashbackData.totalEarned)}</p>
              </div>
              <div className="bg-secondary p-4 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Days Left (Month)</p>
                <p className="text-xl font-medium text-foreground mt-1 tabular-nums">{daily_cashback.max_days_per_month - cashbackData.monthlyCredits}</p>
              </div>
              <div className="bg-secondary p-4 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Months Left</p>
                <p className="text-xl font-medium text-foreground mt-1 tabular-nums">{daily_cashback.valid_months - cashbackData.monthsCompleted}</p>
              </div>
            </div>

            {alreadyCredited && countdown && (
              <div className="bg-secondary p-3 rounded-lg border border-border text-center">
                <p className="text-xs text-muted-foreground">Next cashback in</p>
                <p className="text-lg font-medium text-foreground tabular-nums mt-1">{countdown}</p>
              </div>
            )}

            <div
              className={`w-full py-4 rounded-lg text-sm font-medium transition-all shadow-sm flex flex-col items-center justify-center gap-1 ${
                alreadyCredited
                  ? 'bg-success/10 text-success border border-success/20'
                  : 'bg-secondary text-muted-foreground border border-border'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon 
                  icon={alreadyCredited ? 'solar:check-read-linear' : 'solar:clock-circle-linear'} 
                  width={20} 
                  className={alreadyCredited ? 'text-success' : 'text-muted-foreground'}
                />
                <span className="text-base">{getStatusMessage()}</span>
              </div>
              <p className="text-[10px] opacity-70">₹{daily_cashback.daily_amount} daily cashback is now automated</p>
            </div>
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
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">Earnings when your referrals get daily cashback</p>
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
    </div>
  );
};

export default DailyCashbackView;
