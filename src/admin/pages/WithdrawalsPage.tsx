import { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@admin/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Check, X, Download, ChevronLeft, ChevronRight, ArrowDownToLine, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@admin/hooks/use-mobile";
import api from "@/lib/api";

const ITEMS_PER_PAGE = 10;

const WithdrawalsPage = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const isMobile = useIsMobile();

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/withdrawals');
      // Backend returns array of withdrawals with user populated
      setWithdrawals(res.data);
    } catch (error: any) {
      toast.error("Failed to fetch withdrawals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/api/admin/withdraw/${id}`, { status: 'approved' });
      setWithdrawals(prev => prev.map(w => w._id === id ? { ...w, status: 'approved' } : w));
      toast.success("Withdrawal approved");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/api/admin/withdraw/${id}`, { status: 'rejected', adminMessage: 'Withdrawal request rejected by admin' });
      setWithdrawals(prev => prev.map(w => w._id === id ? { ...w, status: 'rejected' } : w));
      toast.error("Withdrawal rejected – balance refunded");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const filtered = (withdrawals || []).filter((w) => {
    const username = w.user?.userName || "";
    const name = w.user?.name || "";
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || username.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
  const totalPending = withdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + w.netAmount, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Withdrawals</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">{pendingCount} pending · {formatCurrency(totalPending)}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 hidden sm:flex"><Download className="h-4 w-4" /> Export</Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <div className="relative flex-1 min-w-0 sm:min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 bg-secondary border-border" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16">
          <ArrowDownToLine className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No withdrawal requests</p>
          <p className="text-xs text-muted-foreground/60">Requests will appear here when users submit them</p>
        </div>
      ) : isMobile ? (
        <div className="space-y-3">
          {paginated.map((w) => (
            <div key={w._id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${w.status === 'approved' ? 'bg-success/10' : w.status === 'pending' ? 'bg-warning/10' : 'bg-destructive/10'}`}>
                    {w.status === 'approved' ? <CheckCircle2 className="h-4 w-4 text-success" /> : w.status === 'pending' ? <Clock className="h-4 w-4 text-warning" /> : <X className="h-4 w-4 text-destructive" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{w.user?.name || 'Unknown'}</p>
                    <p className="text-[10px] text-muted-foreground">{w.user?.userName}</p>
                  </div>
                </div>
                <span className={w.status === 'approved' ? 'status-badge-success' : w.status === 'pending' ? 'status-badge-warning' : 'status-badge-destructive'}>{w.status}</span>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                <div><p className="text-[10px] text-muted-foreground">Net Amount</p><p className="text-sm font-bold text-foreground">{formatCurrency(w.netAmount)}</p></div>
                <div className="text-right"><p className="text-[10px] text-muted-foreground">Fee</p><p className="text-xs font-medium text-destructive">{formatCurrency(w.adminCharge + w.tdsCharge)}</p></div>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground border-t border-border/30 pt-2">
                <p>Bank: {w.paymentDetails?.bankName}</p>
                <p>A/C: {w.paymentDetails?.accountNumber}</p>
              </div>
              {w.status === 'pending' && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="flex-1 gap-1.5 bg-success/10 text-success hover:bg-success/20 border-0" variant="outline" onClick={() => handleApprove(w._id)}><Check className="h-3.5 w-3.5" /> Approve</Button>
                  <Button size="sm" className="flex-1 gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 border-0" variant="outline" onClick={() => handleReject(w._id)}><X className="h-3.5 w-3.5" /> Reject</Button>
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
                <th className="data-table-header px-4 py-3 text-left">ID</th>
                <th className="data-table-header px-4 py-3 text-left">User</th>
                <th className="data-table-header px-4 py-3 text-right">Amount</th>
                <th className="data-table-header px-4 py-3 text-right">Charges</th>
                <th className="data-table-header px-4 py-3 text-right">Net</th>
                <th className="data-table-header px-4 py-3 text-left">Bank Details</th>
                <th className="data-table-header px-4 py-3 text-left">Date</th>
                <th className="data-table-header px-4 py-3 text-center">Status</th>
                <th className="data-table-header px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((w) => (
                <tr key={w._id} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{w._id?.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3"><p className="font-medium text-foreground">{w.user?.name || 'Unknown'}</p><p className="text-xs text-muted-foreground">{w.user?.userName}</p></td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">{formatCurrency(w.amount)}</td>
                  <td className="px-4 py-3 text-right font-mono text-destructive">{formatCurrency(w.adminCharge + w.tdsCharge)}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">{formatCurrency(w.netAmount)}</td>
                  <td className="px-4 py-3 text-[11px]">
                    <p className="text-foreground font-medium">{w.paymentDetails?.accountHolder}</p>
                    <p className="text-muted-foreground">{w.paymentDetails?.bankName}</p>
                    <p className="font-mono text-muted-foreground">{w.paymentDetails?.accountNumber}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(w.createdAt)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={w.status === 'approved' ? 'status-badge-success' : w.status === 'pending' ? 'status-badge-warning' : 'status-badge-destructive'}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{w.status === 'pending' ? (
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:bg-success/10" onClick={() => handleApprove(w._id)}><Check className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleReject(w._id)}><X className="h-4 w-4" /></Button>
                    </div>
                  ) : <span className="text-xs text-muted-foreground">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">{(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-xs text-foreground">{page}/{totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalsPage;
