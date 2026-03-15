import { Icon } from '@iconify/react';
import { useApp } from '@/context/AppContext';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'solar:widget', group: 'Main Menu' },
  { id: 'activate', label: 'Activate ID', icon: 'solar:shield-check', group: 'Main Menu' },
  { id: 'pins', label: 'E-Pins', icon: 'solar:ticket', group: 'Main Menu' },
  { id: 'cashback', label: 'Daily Cashback', icon: 'solar:hand-money', group: 'Growth' },
  { id: 'income', label: 'Dream Autopool Club', icon: 'solar:layers-minimalistic', group: 'Growth' },
  { id: 'team', label: 'My Network', icon: 'solar:users-group-rounded', group: 'Growth' },
  { id: 'joining', label: 'Packages', icon: 'solar:box', group: 'Growth' },
  { id: 'kyc', label: 'KYC', icon: 'solar:shield-user', group: 'Finance' },
  { id: 'wallet', label: 'Withdrawal', icon: 'solar:wallet-money', group: 'Finance' },
  { id: 'payout', label: 'Statements', icon: 'solar:bill-list', group: 'Finance' },
];

const Sidebar = () => {
  const { state, dispatch } = useApp();

  const groups = navItems.reduce<Record<string, typeof navItems>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <>
      {/* Mobile Backdrop */}
      {state.sidebarOpen && (
        <div
          onClick={() => dispatch({ type: 'CLOSE_SIDEBAR' })}
          className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed md:static w-72 h-full bg-card border-r border-border/60 flex flex-col z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${state.sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        {/* Brand */}
        <div className="p-6 md:p-8 flex items-center justify-between h-20">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-medium tracking-tight text-sm">
              H
            </div>
            <span className="text-lg font-medium tracking-tight text-foreground">
              Help Each Other<span className="text-muted-foreground font-normal"> Pvt.</span>
            </span>
          </div>
          <button
            onClick={() => dispatch({ type: 'CLOSE_SIDEBAR' })}
            className="md:hidden text-muted-foreground hover:text-foreground transition-colors -mr-2 p-2"
          >
            <Icon icon="solar:close-circle-linear" width={22} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 md:px-5 space-y-0.5 overflow-y-auto md-custom-scrollbar">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3 mt-4 first:mt-2">
                {group}
              </div>
              {items.map(item => {
                const isActive = state.activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => dispatch({ type: 'SET_TAB', tab: item.id })}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal transition-all duration-200 group ${isActive
                      ? 'text-foreground bg-secondary border border-border'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent hover:border-border'
                      }`}
                  >
                    <Icon
                      icon={`${item.icon}-${isActive ? 'bold' : 'linear'}`}
                      width={18}
                      className={`transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Mini Profile */}
        <div className="p-4 border-t border-border/50 bg-card">
          <button
            onClick={() => dispatch({ type: 'SET_TAB', tab: 'profile' })}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors group cursor-pointer text-left border border-transparent hover:border-border"
          >
            <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground border border-border">
              {state.user.name ? state.user.name.split(' ').map(n => n[0]).join('') : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{state.user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground font-normal truncate">ID: {state.user.id || 'Pending'}</p>
            </div>
            <Icon icon="solar:settings-linear" width={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
