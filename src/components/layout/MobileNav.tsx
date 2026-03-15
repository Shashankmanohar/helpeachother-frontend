import { Icon } from '@iconify/react';
import { useApp } from '@/context/AppContext';

const items = [
  { id: 'dashboard', label: 'Home', icon: 'solar:widget' },
  { id: 'income', label: 'Pool', icon: 'solar:layers-minimalistic' },
  { id: 'wallet', label: '', icon: 'solar:wallet', isCenter: true },
  { id: 'team', label: 'Team', icon: 'solar:users-group-rounded' },
  { id: 'profile', label: 'Profile', icon: 'solar:user' },
];

const MobileNav = () => {
  const { state, dispatch } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-card/90 backdrop-blur-xl border-t border-border pb-safe-bottom z-40 grid grid-cols-5 px-2">
      {items.map(item => {
        const isActive = state.activeTab === item.id;
        if (item.isCenter) {
          return (
            <button
              key={item.id}
              onClick={() => dispatch({ type: 'SET_TAB', tab: item.id })}
              className="flex flex-col items-center justify-center -mt-6"
            >
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg click-scale border-4 border-background">
                <Icon icon={`${item.icon}-linear`} width={20} />
              </div>
            </button>
          );
        }
        return (
          <button
            key={item.id}
            onClick={() => dispatch({ type: 'SET_TAB', tab: item.id })}
            className={`flex flex-col items-center justify-center py-3 gap-1 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            <Icon icon={`${item.icon}-${isActive ? 'bold' : 'linear'}`} width={20} />
            <span className="text-[10px] font-normal">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;
