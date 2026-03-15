import { Icon } from '@iconify/react';
import { BusinessPlan } from '@/config/businessPlan';

const NetworkView = () => {
  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-medium text-foreground tracking-tight">Genealogy Tree & Levels</h1>
        <p className="text-sm text-muted-foreground mt-1">Visual representation of your network and level hierarchy.</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-8 shadow-sm overflow-x-auto text-center min-h-[300px] flex items-center justify-center">
        <div className="tree inline-block min-w-full">
          <ul>
            <li>
              <a className="inline-flex flex-col items-center gap-1 p-2 bg-primary text-primary-foreground rounded-xl shadow-sm border border-primary relative z-10 w-14 h-14 justify-center">
                <span className="text-[10px] font-medium">YOU</span>
              </a>
              <ul>
                <li>
                  <a className="inline-flex flex-col items-center gap-1 p-2 bg-card border border-border rounded-xl w-12 h-12 justify-center shadow-sm text-muted-foreground">
                    <Icon icon="solar:user-linear" />
                  </a>
                  <ul>
                    <li><a className="inline-flex flex-col items-center gap-1 p-2 bg-card border border-dashed border-border rounded-xl w-10 h-10 justify-center text-muted-foreground/40"><Icon icon="solar:add-circle-linear" /></a></li>
                    <li><a className="inline-flex flex-col items-center gap-1 p-2 bg-card border border-dashed border-border rounded-xl w-10 h-10 justify-center text-muted-foreground/40"><Icon icon="solar:add-circle-linear" /></a></li>
                  </ul>
                </li>
                <li><a className="inline-flex flex-col items-center gap-1 p-2 bg-card border border-border rounded-xl w-12 h-12 justify-center shadow-sm text-muted-foreground"><Icon icon="solar:user-linear" /></a></li>
                <li><a className="inline-flex flex-col items-center gap-1 p-2 bg-card border border-border rounded-xl w-12 h-12 justify-center shadow-sm text-muted-foreground"><Icon icon="solar:user-linear" /></a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium tracking-tight text-foreground mb-4">Level Income Structure</h3>
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
              <tr>
                <th className="p-4 font-medium">Level</th>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {BusinessPlan.level_income_structure.levels.map(l => (
                <tr key={l.level} className="hover:bg-secondary transition-colors">
                  <td className="p-4 text-foreground font-normal">Level {l.level}</td>
                  <td className="p-4 text-muted-foreground text-xs font-medium">{l.title}</td>
                  <td className="p-4 text-success font-medium">{l.points} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NetworkView;
