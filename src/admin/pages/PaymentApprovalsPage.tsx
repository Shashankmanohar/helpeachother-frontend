import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import {
    CheckCircle2,
    XCircle,
    Loader2,
    RefreshCcw,
    User,
    Mail,
    Calendar,
    IndianRupee,
    Search,
    CreditCard,
    AlertCircle
} from 'lucide-react';

interface PendingUser {
    _id: string;
    userName: string;
    name: string;
    email: string;
    paymentStatus: string;
    createdAt: string;
    updatedAt: string;
}

const PaymentApprovalsPage = () => {
    const [users, setUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fetchPendingPayments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('heo_admin_token');
            const response = await api.get('/api/admin/pending-payments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data || []);
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Failed to fetch pending payments';
            setError(msg);
            console.error('Fetch pending payments error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingPayments();
    }, [fetchPendingPayments]);

    const handleAction = async (userId: string, action: 'approved' | 'rejected') => {
        setActionLoading(userId);
        try {
            const token = localStorage.getItem('heo_admin_token');
            await api.put(`/api/admin/approve-payment/${userId}`, { action }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(prev => prev.filter(u => u._id !== userId));
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Failed to update payment';
            setError(msg);
            console.error('Approve/reject error:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <CreditCard className="h-6 w-6 text-primary" />
                        Payment Approvals
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Approve or reject user registration payments
                    </p>
                </div>
                <Button
                    onClick={fetchPendingPayments}
                    variant="outline"
                    className="gap-2"
                    disabled={loading}
                >
                    <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">✕</button>
                </div>
            )}

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search by name, username, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Pending Approvals</p>
                    <p className="text-2xl font-bold text-amber-400">{users.length}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Amount per User</p>
                    <div className="flex items-center gap-1">
                        <IndianRupee className="h-5 w-5 text-emerald-400" />
                        <p className="text-2xl font-bold text-emerald-400">1,199</p>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Pending Value</p>
                    <div className="flex items-center gap-1">
                        <IndianRupee className="h-5 w-5 text-primary" />
                        <p className="text-2xl font-bold text-primary">{(users.length * 1199).toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>

            {/* Table / Cards */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-20 bg-card border border-border rounded-xl">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">All Clear!</h3>
                    <p className="text-sm text-muted-foreground mt-1">No pending payment approvals</p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-secondary/30">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Submitted</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">@{user.userName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="w-3.5 h-3.5" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(user.updatedAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm font-semibold text-emerald-400">₹1,199</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAction(user._id, 'approved')}
                                                    disabled={actionLoading === user._id}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1 h-8 px-3 text-xs"
                                                >
                                                    {actionLoading === user._id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="w-3 h-3" />
                                                    )}
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAction(user._id, 'rejected')}
                                                    disabled={actionLoading === user._id}
                                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1 h-8 px-3 text-xs"
                                                >
                                                    <XCircle className="w-3 h-3" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-border">
                        {filteredUsers.map((user) => (
                            <div key={user._id} className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">@{user.userName}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-emerald-400">₹1,199</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(user.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleAction(user._id, 'approved')}
                                        disabled={actionLoading === user._id}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white gap-1 h-9 text-xs"
                                    >
                                        {actionLoading === user._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleAction(user._id, 'rejected')}
                                        disabled={actionLoading === user._id}
                                        className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1 h-9 text-xs"
                                    >
                                        <XCircle className="w-3 h-3" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentApprovalsPage;
