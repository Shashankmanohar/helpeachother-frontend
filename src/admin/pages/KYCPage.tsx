import { useState } from "react";
import { type KYCRecord } from "@admin/lib/mock-data";
import { formatDate } from "@admin/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Check, X, CreditCard, Building2, FileText,
  ChevronLeft, ChevronRight, Eye, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@admin/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 10;

const KYCPage = () => {
  const isMobile = useIsMobile();
  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<KYCRecord | null>(null);

  const filtered = records.filter((r) => {
    const matchSearch = r.userId.toLowerCase().includes(search.toLowerCase()) || r.username.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleApprove = (userId: string) => {
    setRecords(prev => prev.map(r => r.userId === userId ? { ...r, status: 'approved' as const } : r));
    setSelectedRecord(null);
    toast.success("KYC approved");
  };

  const handleReject = (userId: string) => {
    setRecords(prev => prev.map(r => r.userId === userId ? { ...r, status: 'rejected' as const } : r));
    setSelectedRecord(null);
    toast.error("KYC rejected");
  };

  const pending = records.filter(r => r.status === 'pending').length;
  const approved = records.filter(r => r.status === 'approved').length;
  const rejected = records.filter(r => r.status === 'rejected').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">KYC Verification</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">Review Aadhaar, PAN & bank account details</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending', count: pending, icon: FileText, color: 'text-warning' },
          { label: 'Approved', count: approved, icon: ShieldCheck, color: 'text-success' },
          { label: 'Rejected', count: rejected, icon: X, color: 'text-destructive' },
        ].map((s) => (
          <motion.div
            key={s.label}
            className="metric-card text-center"
            whileHover={{ scale: 1.03 }}
          >
            <s.icon className={`mx-auto mb-1.5 h-5 w-5 ${s.color}`} />
            <p className={`text-2xl font-bold sm:text-3xl ${s.color}`}>{s.count}</p>
            <p className="text-[10px] text-muted-foreground sm:text-sm">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="relative flex-1 min-w-0 sm:min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by user..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 bg-secondary border-border" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16">
          <CreditCard className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No KYC submissions yet</p>
          <p className="text-xs text-muted-foreground/60">User KYC submissions will appear here</p>
        </div>
      ) : isMobile ? (
        <div className="space-y-2.5">
          <AnimatePresence>
            {paginated.map((r) => (
              <motion.div
                key={r.userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card p-4"
                onClick={() => setSelectedRecord(r)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${r.status === 'approved' ? 'bg-success/10' : r.status === 'pending' ? 'bg-warning/10' : 'bg-destructive/10'
                      }`}>
                      <CreditCard className={`h-4 w-4 ${r.status === 'approved' ? 'text-success' : r.status === 'pending' ? 'text-warning' : 'text-destructive'
                        }`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r.username}</p>
                      <p className="text-[10px] text-muted-foreground">{r.userId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={
                      r.status === 'approved' ? 'status-badge-success' :
                        r.status === 'pending' ? 'status-badge-warning' : 'status-badge-destructive'
                    }>{r.status}</span>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-secondary/50 p-2">
                    <p className="text-[10px] text-muted-foreground">Aadhaar</p>
                    <p className="text-xs font-mono text-foreground">****{r.aadhaarNumber.slice(-4)}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-2">
                    <p className="text-[10px] text-muted-foreground">Bank</p>
                    <p className="text-xs font-mono text-foreground">{r.bankName}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="data-table-header px-4 py-3 text-left">User</th>
                <th className="data-table-header px-4 py-3 text-left">Aadhaar</th>
                <th className="data-table-header px-4 py-3 text-left">PAN</th>
                <th className="data-table-header px-4 py-3 text-left">Bank Account</th>
                <th className="data-table-header px-4 py-3 text-left">Bank</th>
                <th className="data-table-header px-4 py-3 text-center">Status</th>
                <th className="data-table-header px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r) => (
                <tr key={r.userId} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{r.username}</p>
                    <p className="font-mono text-xs text-muted-foreground">{r.userId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-foreground">{r.aadhaarNumber}</p>
                    <p className="text-xs text-muted-foreground">{r.aadhaarName}</p>
                  </td>
                  <td className="px-4 py-3">
                    {r.panNumber ? (
                      <>
                        <p className="font-mono text-xs text-foreground">{r.panNumber}</p>
                        <p className="text-xs text-muted-foreground">{r.panName}</p>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Not provided</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-foreground">{r.bankAccountNumber}</p>
                    <p className="text-xs text-muted-foreground">IFSC: {r.bankIFSC}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-foreground">{r.bankName}</p>
                    <p className="text-xs text-muted-foreground">{r.accountHolderName}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={
                      r.status === 'approved' ? 'status-badge-success' :
                        r.status === 'pending' ? 'status-badge-warning' : 'status-badge-destructive'
                    }>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => setSelectedRecord(r)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {r.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:bg-success/10" onClick={() => handleApprove(r.userId)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleReject(r.userId)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {records.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-xs text-foreground">{page}/{totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-lg bg-card border-border max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              KYC Details – {selectedRecord?.username}
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-5">
              {/* Aadhaar Section */}
              <div className="rounded-xl border border-border bg-secondary/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">Aadhaar Card</h4>
                  <span className="status-badge-success text-[10px] ml-auto">Required</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Aadhaar Number</p>
                    <p className="text-sm font-mono font-medium text-foreground">{selectedRecord.aadhaarNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Name on Aadhaar</p>
                    <p className="text-sm font-medium text-foreground">{selectedRecord.aadhaarName}</p>
                  </div>
                </div>
              </div>

              {/* PAN Section */}
              <div className="rounded-xl border border-border bg-secondary/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">PAN Card</h4>
                  <span className="text-[10px] rounded-full px-2 py-0.5 bg-muted text-muted-foreground ml-auto">Optional</span>
                </div>
                {selectedRecord.panNumber ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground">PAN Number</p>
                      <p className="text-sm font-mono font-medium text-foreground">{selectedRecord.panNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Name on PAN</p>
                      <p className="text-sm font-medium text-foreground">{selectedRecord.panName}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Not provided</p>
                )}
              </div>

              {/* Bank Account Section */}
              <div className="rounded-xl border border-border bg-secondary/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">Bank Account</h4>
                  <span className="status-badge-success text-[10px] ml-auto">Required</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Account Number</p>
                    <p className="text-sm font-mono font-medium text-foreground">{selectedRecord.bankAccountNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">IFSC Code</p>
                    <p className="text-sm font-mono font-medium text-foreground">{selectedRecord.bankIFSC}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Bank Name</p>
                    <p className="text-sm font-medium text-foreground">{selectedRecord.bankName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Account Holder</p>
                    <p className="text-sm font-medium text-foreground">{selectedRecord.accountHolderName}</p>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Current Status</p>
                  <span className={
                    selectedRecord.status === 'approved' ? 'status-badge-success' :
                      selectedRecord.status === 'pending' ? 'status-badge-warning' : 'status-badge-destructive'
                  }>{selectedRecord.status}</span>
                </div>
                {selectedRecord.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1.5 bg-success/10 text-success hover:bg-success/20 border-0" variant="outline" onClick={() => handleApprove(selectedRecord.userId)}>
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button size="sm" className="gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 border-0" variant="outline" onClick={() => handleReject(selectedRecord.userId)}>
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KYCPage;
