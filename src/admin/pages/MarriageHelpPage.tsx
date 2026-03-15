import { useState } from "react";
import { Heart, Check, X, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@admin/lib/formatters";
import { useIsMobile } from "@admin/hooks/use-mobile";
import { toast } from "sonner";

interface MarriageClaim {
  userId: string;
  username: string;
  status: 'pending' | 'approved' | 'rejected';
  amount: number;
  teamCount: number;
  date: string;
}

const MarriageHelpPage = () => {
  const isMobile = useIsMobile();
  const [claims, setClaims] = useState<MarriageClaim[]>([]);

  const handleApprove = (userId: string) => {
    setClaims(prev => prev.map(c => c.userId === userId ? { ...c, status: 'approved' as const } : c));
    toast.success("Marriage help claim approved");
  };

  const handleReject = (userId: string) => {
    setClaims(prev => prev.map(c => c.userId === userId ? { ...c, status: 'rejected' as const } : c));
    toast.error("Marriage help claim rejected");
  };

  const pending = claims.filter(c => c.status === 'pending').length;
  const approved = claims.filter(c => c.status === 'approved').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Marriage Help Claims</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">Review and manage marriage assistance</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="metric-card text-center">
          <Clock className="mx-auto mb-1.5 h-5 w-5 text-warning" />
          <p className="text-2xl font-bold text-warning sm:text-3xl">{pending}</p>
          <p className="text-[10px] text-muted-foreground sm:text-sm">Pending</p>
        </div>
        <div className="metric-card text-center">
          <CheckCircle2 className="mx-auto mb-1.5 h-5 w-5 text-success" />
          <p className="text-2xl font-bold text-success sm:text-3xl">{approved}</p>
          <p className="text-[10px] text-muted-foreground sm:text-sm">Approved</p>
        </div>
        <div className="metric-card text-center">
          <Heart className="mx-auto mb-1.5 h-5 w-5 text-primary" />
          <p className="text-xl font-bold text-foreground sm:text-3xl">{formatCurrency(approved * 51000)}</p>
          <p className="text-[10px] text-muted-foreground sm:text-sm">Disbursed</p>
        </div>
      </div>

      {claims.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16">
          <Heart className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No marriage help claims</p>
          <p className="text-xs text-muted-foreground/60">Eligible claims will appear here</p>
        </div>
      ) : isMobile ? (
        <div className="space-y-3">
          {claims.map((c) => (
            <div key={c.userId} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${c.status === 'approved' ? 'bg-success/10' : 'bg-warning/10'}`}>
                    <Heart className={`h-4 w-4 ${c.status === 'approved' ? 'text-success' : 'text-warning'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.username}</p>
                    <p className="text-[10px] text-muted-foreground">Team: {c.teamCount}</p>
                  </div>
                </div>
                <span className={c.status === 'approved' ? 'status-badge-success' : c.status === 'pending' ? 'status-badge-warning' : 'status-badge-destructive'}>{c.status}</span>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                <span className="text-xs text-muted-foreground">Claim Amount</span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(c.amount)}</span>
              </div>
              {c.status === 'pending' && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="flex-1 gap-1.5 bg-success/10 text-success hover:bg-success/20 border-0" variant="outline" onClick={() => handleApprove(c.userId)}><Check className="h-3.5 w-3.5" /> Approve</Button>
                  <Button size="sm" className="flex-1 gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 border-0" variant="outline" onClick={() => handleReject(c.userId)}><X className="h-3.5 w-3.5" /> Reject</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="data-table-header px-4 py-3 text-left">User</th>
                <th className="data-table-header px-4 py-3 text-right">Amount</th>
                <th className="data-table-header px-4 py-3 text-center">Team</th>
                <th className="data-table-header px-4 py-3 text-center">Status</th>
                <th className="data-table-header px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.userId} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                  <td className="px-4 py-3"><p className="font-medium text-foreground">{c.username}</p><p className="font-mono text-xs text-muted-foreground">{c.userId}</p></td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">{formatCurrency(c.amount)}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{c.teamCount}</td>
                  <td className="px-4 py-3 text-center"><span className={c.status === 'approved' ? 'status-badge-success' : c.status === 'pending' ? 'status-badge-warning' : 'status-badge-destructive'}>{c.status}</span></td>
                  <td className="px-4 py-3">{c.status === 'pending' && (
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:bg-success/10" onClick={() => handleApprove(c.userId)}><Check className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleReject(c.userId)}><X className="h-4 w-4" /></Button>
                    </div>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MarriageHelpPage;
