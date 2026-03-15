import { useState } from "react";
import { mockTransactions, type Transaction } from "@admin/lib/mock-data";
import { formatCurrency, formatDate } from "@admin/lib/formatters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Receipt } from "lucide-react";
import { useIsMobile } from "@admin/hooks/use-mobile";

const ITEMS_PER_PAGE = 10;

const TransactionsPage = () => {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const isMobile = useIsMobile();

  const filtered = transactions.filter((t) => {
    const matchSearch = t.userId.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Transactions</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">Monitor all system transactions</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 hidden sm:flex"><Download className="h-4 w-4" /> Export</Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <div className="relative flex-1 min-w-0 sm:min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 bg-secondary border-border" />
        </div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground">
          <option value="all">All Types</option>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16">
          <Receipt className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No transactions recorded</p>
          <p className="text-xs text-muted-foreground/60">Transactions will appear as the system processes them</p>
        </div>
      ) : isMobile ? (
        <div className="space-y-2.5">
          {paginated.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${t.type === 'credit' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  {t.type === 'credit' ? <ArrowUpRight className="h-4 w-4 text-success" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{t.category}</p>
                  <p className="text-[10px] text-muted-foreground">{t.userId} · {formatDate(t.date)}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${t.type === 'credit' ? 'text-success' : 'text-destructive'}`}>
                {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
              </span>
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
                <th className="data-table-header px-4 py-3 text-left">Category</th>
                <th className="data-table-header px-4 py-3 text-center">Type</th>
                <th className="data-table-header px-4 py-3 text-right">Amount</th>
                <th className="data-table-header px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((t) => (
                <tr key={t.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{t.userId}</td>
                  <td className="px-4 py-3 text-foreground">{t.category}</td>
                  <td className="px-4 py-3 text-center"><span className={t.type === 'credit' ? 'status-badge-success' : 'status-badge-destructive'}>{t.type}</span></td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${t.type === 'credit' ? 'text-success' : 'text-destructive'}`}>{t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(t.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="flex items-center justify-between">
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

export default TransactionsPage;
