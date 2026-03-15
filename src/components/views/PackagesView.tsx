import { Icon } from '@iconify/react';
import { BusinessPlan } from '@/config/businessPlan';

const PackagesView = () => {
  const fee = BusinessPlan.direct_seller_onboarding.activation.activation_fee;

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-medium text-foreground tracking-tight">Packages</h1>
        <p className="text-sm text-muted-foreground mt-1">Company unified activation package.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card p-6 rounded-xl border-2 border-success shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-success text-success-foreground text-[10px] font-medium px-3 py-1 rounded-bl-lg tracking-wider">CURRENT</div>
          <h3 className="text-base font-medium text-foreground">Standard Activation</h3>
          <h2 className="text-2xl font-medium text-foreground mt-1 tracking-tight">₹{fee.toLocaleString()}</h2>
          <ul className="mt-6 space-y-3">
            {['Full Business Eligibility', 'Access to Dream Autopool Club', 'Level Income & Pin Income'].map(item => (
              <li key={item} className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                <Icon icon="solar:check-circle-linear" className="text-success" width={16} /> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PackagesView;
