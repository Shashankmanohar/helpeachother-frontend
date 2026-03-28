import { Icon } from '@iconify/react';
import { useApp } from '@/context/AppContext';
import { fmt } from '@/utils/format';

const titles: Record<string, string> = {
  dashboard: 'Dashboard', income: 'Autopool Club', team: 'My Network',
  pins: 'E-Pins', wallet: 'Withdrawal', activate: 'Activate ID',
  joining: 'Packages', payout: 'Statements', profile: 'Profile & Settings',
  cashback: 'Daily Cashback',
};

const Header = () => {
  const { state, dispatch } = useApp();

  return (
    <header className="sticky top-0 z-30 glass border-b border-border/60 px-4 md:px-8 py-3.5 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-3 md:hidden" onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}>
        <button className="h-9 w-9 -ml-2 flex items-center justify-center text-muted-foreground active:scale-90 transition-transform">
          <Icon icon="solar:hamburger-menu-linear" width={22} />
        </button>
        <span className="font-bold text-foreground text-base tracking-tight uppercase">HEO Sahyog</span>
      </div>
      <div className="hidden md:block">
        <h2 className="text-sm font-medium text-muted-foreground tracking-tight">
          Overview / <span className="text-foreground">{titles[state.activeTab] || 'Dashboard'}</span>
        </h2>
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-light border border-success text-xs font-medium shadow-sm">
          <span className="w-2 h-2 rounded-full bg-success" />
          ₹<span className="tabular-nums">{fmt(state.wallet.balance)}</span>
        </div>
        <button 
          onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
          className="h-9 w-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground click-scale hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Icon icon={state.theme === 'dark' ? 'solar:sun-linear' : 'solar:moon-linear'} width={18} />
        </button>
        <button className="h-9 w-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground relative click-scale hover:bg-secondary hover:text-foreground transition-colors">
          <Icon icon="solar:bell-linear" width={18} />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-destructive rounded-full ring-2 ring-card" />
        </button>
      </div>
    </header>
  );
};

export default Header;
