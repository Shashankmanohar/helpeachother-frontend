import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Save, DollarSign, Layers, Heart, Percent, GitBranch } from "lucide-react";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    activationFee: "500",
    autopoolEntry2500: "2500",
    autopoolEntry5000: "5000",
    autopoolEntry7500: "7500",
    autopoolEntry10000: "10000",
    autopoolReward2500: "5000",
    autopoolReward5000: "12000",
    autopoolReward7500: "25000",
    autopoolReward10000: "50000",
    marriageHelpAmount: "51000",
    marriageMinTeam: "50",
    withdrawalMinAmount: "500",
    adminFeePercent: "10",
    tdsPercent: "5",
    levelIncome: "10,5,3,2,1",
  });

  const handleSave = () => {
    toast.success("System settings updated successfully");
  };

  const sections = [
    { title: "Activation", icon: DollarSign, fields: [{ key: "activationFee", label: "Activation Fee (₹)" }] },
    { title: "Autopool Entry", icon: Layers, fields: [
      { key: "autopoolEntry2500", label: "Tier 1 (₹)" },
      { key: "autopoolEntry5000", label: "Tier 2 (₹)" },
      { key: "autopoolEntry7500", label: "Tier 3 (₹)" },
      { key: "autopoolEntry10000", label: "Tier 4 (₹)" },
    ]},
    { title: "Autopool Rewards", icon: Layers, fields: [
      { key: "autopoolReward2500", label: "Tier 1 (₹)" },
      { key: "autopoolReward5000", label: "Tier 2 (₹)" },
      { key: "autopoolReward7500", label: "Tier 3 (₹)" },
      { key: "autopoolReward10000", label: "Tier 4 (₹)" },
    ]},
    { title: "Marriage Help", icon: Heart, fields: [
      { key: "marriageHelpAmount", label: "Amount (₹)" },
      { key: "marriageMinTeam", label: "Min Team" },
    ]},
    { title: "Withdrawal & Fees", icon: Percent, fields: [
      { key: "withdrawalMinAmount", label: "Min Withdrawal (₹)" },
      { key: "adminFeePercent", label: "Admin Fee (%)" },
      { key: "tdsPercent", label: "TDS (%)" },
    ]},
    { title: "Level Income", icon: GitBranch, fields: [{ key: "levelIncome", label: "Levels (%)" }] },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">System Settings</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">Configure business logic parameters</p>
        </div>
        <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave}>
          <Save className="h-3.5 w-3.5" /> Save
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {sections.map((section) => (
          <div key={section.title} className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2 sm:mb-4">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <section.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-xs font-semibold text-foreground sm:text-sm">{section.title}</h3>
            </div>
            <div className="space-y-3">
              {section.fields.map((field) => (
                <div key={field.key} className="flex items-center justify-between gap-3">
                  <label className="text-xs text-muted-foreground sm:text-sm">{field.label}</label>
                  <Input
                    value={settings[field.key as keyof typeof settings]}
                    onChange={(e) => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-28 bg-secondary border-border text-right font-mono text-sm sm:w-40"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
