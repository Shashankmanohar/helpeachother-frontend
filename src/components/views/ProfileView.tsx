import { Icon } from '@iconify/react';
import { useApp } from '@/context/AppContext';
import { BusinessPlan } from '@/config/businessPlan';

const ProfileView = () => {
  const { state, dispatch, showToast, addTx } = useApp();
  const comp = BusinessPlan.company_overview;

  const verifyKyc = () => {
    dispatch({ type: 'SET_KYC', value: true });
    showToast('KYC Verified Successfully');
  };

  const claimMarriage = () => {
    if (state.user.marriageClaimed) return showToast('Already Claimed', 'error');
    const req = BusinessPlan.special_benefits.marriage_help.conditions;
    if (state.team.direct >= req.direct && state.team.active >= req.active) {
      addTx('credit', BusinessPlan.special_benefits.marriage_help.amount, 'Marriage Help Fund');
      dispatch({ type: 'CLAIM_MARRIAGE' });
      showToast('Marriage Benefit Credited!');
    } else {
      showToast('Eligibility requirements not met.', 'error');
    }
  };

  const logout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      dispatch({ type: 'RESET' });
      window.location.href = '/';
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-medium text-foreground tracking-tight">Profile & Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and benefits.</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center text-xl font-medium text-muted-foreground border border-border">
            {state.user.name ? state.user.name.split(' ').map(n => n[0]).join('') : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">{state.user.name || 'User'}</h3>
            <p className="text-sm text-muted-foreground font-normal">ID: {state.user.id || 'Pending'} | Code: <span className="text-primary font-bold">{state.user.referralCode || state.user.userName || 'PENDING'}</span></p>

            <div className="mt-2">
              {state.user.kyc ? (
                <div className="inline-flex items-center gap-1.5 bg-success-light text-success px-2 py-0.5 rounded text-[10px] font-medium border border-success-border/50">
                  <Icon icon="solar:verified-check-linear" width={14} /> KYC Verified
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 bg-destructive/10 text-destructive px-2 py-0.5 rounded text-[10px] font-medium border border-destructive/20">
                  <Icon icon="solar:danger-circle-linear" width={14} /> KYC Pending
                </div>
              )}
            </div>
          </div>
        </div>
        {!state.user.kyc && (
          <button onClick={verifyKyc} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors click-scale">
            Submit KYC
          </button>
        )}
      </div>

      {/* Special Benefits */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-secondary/50">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Special Benefits</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border border-indigo-border bg-indigo-light/30 p-4 rounded-xl">
            <div>
              <p className="text-sm font-medium text-indigo">Marriage Help Fund</p>
              <p className="text-xs text-indigo/80 mt-1">Requires 15 Direct Referrals & 35 Active Team Members.</p>
              <p className="text-xs text-muted-foreground mt-2">Current: {state.team.direct} Direct, {state.team.active} Active Team</p>
            </div>
            <button onClick={claimMarriage} className="px-4 py-2 bg-indigo text-indigo-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-colors click-scale shadow-sm whitespace-nowrap">
              Claim ₹5,100
            </button>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-primary text-primary-foreground rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10">
          <Icon icon="solar:buildings-3-linear" width={120} />
        </div>
        <div className="relative z-10">
          <h3 className="text-xs font-normal opacity-70 uppercase tracking-widest mb-1">Company Overview</h3>
          <p className="text-xl tracking-tight mb-4 font-medium">{comp.company_name}</p>
          <p className="text-sm font-normal opacity-80 mb-6 max-w-2xl leading-relaxed">{comp.mission}</p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm font-normal opacity-90 pt-4 border-t border-primary-foreground/10">
            <div className="flex items-center gap-2">
              <Icon icon="solar:letter-linear" width={16} />
              <span>{comp.contact.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="solar:phone-calling-linear" width={16} />
              <span>{comp.contact.phone}</span>
            </div>
          </div>
        </div>
      </div>

      <button onClick={logout} className="w-full py-3 rounded-lg border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 shadow-sm text-sm font-medium click-scale transition-colors">
        Sign Out
      </button>
    </div>
  );
};

export default ProfileView;
