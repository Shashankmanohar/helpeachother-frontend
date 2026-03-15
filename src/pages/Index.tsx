import { AppProvider, useApp } from '@/context/AppContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import ToastContainer from '@/components/layout/ToastContainer';
import DashboardView from '@/components/views/DashboardView';
import PinsView from '@/components/views/PinsView';
import ActivateView from '@/components/views/ActivateView';
import NetworkView from '@/components/views/NetworkView';
import AutopoolView from '@/components/views/AutopoolView';
import WithdrawalView from '@/components/views/WithdrawalView';
import PackagesView from '@/components/views/PackagesView';
import StatementsView from '@/components/views/StatementsView';
import ProfileView from '@/components/views/ProfileView';
import DailyCashbackView from '@/components/views/DailyCashbackView';
import KYCView from '@/components/views/KYCView';

const views: Record<string, React.FC> = {
  dashboard: DashboardView,
  pins: PinsView,
  activate: ActivateView,
  team: NetworkView,
  income: AutopoolView,
  wallet: WithdrawalView,
  joining: PackagesView,
  payout: StatementsView,
  profile: ProfileView,
  cashback: DailyCashbackView,
  kyc: KYCView,
};

const DashboardContent = () => {
  const { state } = useApp();
  const ActiveView = views[state.activeTab] || DashboardView;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <ToastContainer />
      <Sidebar />
      <main className="flex-1 relative h-full overflow-y-auto overflow-x-hidden bg-background scroll-smooth">
        <Header />
        <div className="p-4 pb-28 md:p-8 md:pb-12 max-w-6xl mx-auto min-h-screen">
          <ActiveView key={state.activeTab} />
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

const Index = () => (
  <DashboardContent />
);

export default Index;
