import { useState } from "react";
import { mockUsers, type User } from "@admin/lib/mock-data";
import { formatCurrency, formatDate } from "@admin/lib/formatters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Eye, Ban, Trash2, ChevronLeft, ChevronRight, User as UserIcon, Wallet, Users as UsersIcon, Shield } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@admin/hooks/use-mobile";

const ITEMS_PER_PAGE = 10;

const UsersPage = () => {
  const [users] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [kycFilter, setKycFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const isMobile = useIsMobile();

  const filtered = users.filter((u) => {
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    const matchKyc = kycFilter === "all" || u.kycStatus === kycFilter;
    return matchSearch && matchStatus && matchKyc;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">User Management</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">Manage all users, KYC, activation, and wallets</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <div className="relative flex-1 min-w-0 sm:min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 bg-secondary border-border" />
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="flex-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground sm:flex-none">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={kycFilter} onChange={(e) => { setKycFilter(e.target.value); setPage(1); }} className="flex-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground sm:flex-none">
            <option value="all">All KYC</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16">
          <UsersIcon className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No users registered yet</p>
          <p className="text-xs text-muted-foreground/60">Users will appear here once they sign up</p>
        </div>
      ) : isMobile ? (
        <div className="space-y-3">
          {paginated.map((user) => (
            <div key={user.id} className="rounded-xl border border-border bg-card p-4" onClick={() => setSelectedUser(user)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{user.username}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-secondary/50 p-2 text-center">
                  <Wallet className="mx-auto mb-1 h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground">Wallet</p>
                  <p className="text-xs font-semibold text-foreground">{formatCurrency(user.walletBalance)}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-2 text-center">
                  <UsersIcon className="mx-auto mb-1 h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground">Team</p>
                  <p className="text-xs font-semibold text-foreground">{user.teamCount}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-2 text-center">
                  <Shield className="mx-auto mb-1 h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground">KYC</p>
                  <p className={`text-xs font-semibold ${user.kycStatus === 'approved' ? 'text-success' : user.kycStatus === 'pending' ? 'text-warning' : 'text-destructive'}`}>{user.kycStatus}</p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span className={user.status === 'active' ? 'status-badge-success' : 'status-badge-warning'}>{user.status}</span>
                <span className="text-[10px] text-muted-foreground">{formatDate(user.joinDate)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="data-table-header px-4 py-3 text-left">ID</th>
                <th className="data-table-header px-4 py-3 text-left">Username</th>
                <th className="data-table-header px-4 py-3 text-left">Status</th>
                <th className="data-table-header px-4 py-3 text-left">KYC</th>
                <th className="data-table-header px-4 py-3 text-right">Wallet</th>
                <th className="data-table-header px-4 py-3 text-right">Earned</th>
                <th className="data-table-header px-4 py-3 text-center">Team</th>
                <th className="data-table-header px-4 py-3 text-left">Joined</th>
                <th className="data-table-header px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((user) => (
                <tr key={user.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{user.id}</td>
                  <td className="px-4 py-3"><p className="font-medium text-foreground">{user.username}</p><p className="text-xs text-muted-foreground">{user.email}</p></td>
                  <td className="px-4 py-3"><span className={user.status === 'active' ? 'status-badge-success' : 'status-badge-warning'}>{user.status}</span></td>
                  <td className="px-4 py-3"><span className={user.kycStatus === 'approved' ? 'status-badge-success' : user.kycStatus === 'pending' ? 'status-badge-warning' : 'status-badge-destructive'}>{user.kycStatus}</span></td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">{formatCurrency(user.walletBalance)}</td>
                  <td className="px-4 py-3 text-right font-mono text-success">{formatCurrency(user.totalEarned)}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{user.teamCount}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(user.joinDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => setSelectedUser(user)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-warning hover:bg-warning/10"><Ban className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {users.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground sm:text-sm">{(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-xs text-foreground sm:text-sm">{page}/{totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg bg-card border-border max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">User Details – {selectedUser?.username}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  ["User ID", selectedUser.id],
                  ["Email", selectedUser.email],
                  ["Status", selectedUser.status],
                  ["KYC Status", selectedUser.kycStatus],
                  ["Activation", selectedUser.activationStatus],
                  ["Wallet", formatCurrency(selectedUser.walletBalance)],
                  ["Total Earned", formatCurrency(selectedUser.totalEarned)],
                  ["Direct Count", selectedUser.directCount],
                  ["Team Count", selectedUser.teamCount],
                  ["Marriage Claim", selectedUser.marriageClaim],
                  ["Blocked", selectedUser.blocked ? "Yes" : "No"],
                  ["Joined", formatDate(selectedUser.joinDate)],
                ].map(([label, val]) => (
                  <div key={label as string}>
                    <p className="text-[10px] text-muted-foreground sm:text-xs">{label}</p>
                    <p className="text-xs font-medium text-foreground sm:text-sm">{val}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Add Balance</Button>
                <Button size="sm" variant="outline">Deduct Balance</Button>
                <Button size="sm" variant="outline">Reset Password</Button>
                <Button size="sm" variant="outline" className="text-warning border-warning/30 hover:bg-warning/10">Force Activate</Button>
                <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">Block User</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
