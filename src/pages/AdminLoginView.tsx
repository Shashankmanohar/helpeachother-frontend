import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import {
    Shield,
    Lock,
    Mail,
    ArrowRight,
    Eye,
    EyeOff,
    Terminal,
    AlertCircle
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AdminLoginView = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const { showToast } = useApp();
    const api = useApi();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await api.post('/api/admin/login', formData);

            showToast(`Authentication successful, welcome back ${data.admin.adminName}`, 'success');

            localStorage.setItem('heo_admin_token', data.token);
            localStorage.setItem('heo_admin_user', JSON.stringify(data.admin));

            // Redirect logic
            setTimeout(() => {
                window.location.href = '/admin';
            }, 1000);
        } catch (error) {
            // Error handled by hook
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-mono">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md z-10"
            >
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-widest uppercase">Admin Terminal</h2>
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-emerald-500 uppercase tracking-[0.2em]">Secure Node 5005</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0c0c0d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="bg-white/5 px-6 py-3 border-b border-white/10 flex items-center justify-between">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <Terminal className="w-3 h-3" /> system.auth.v2
                        </span>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Access Identifier</label>
                                    <Mail className="w-3 h-3 text-muted-foreground/30" />
                                </div>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="admin@helpeachother.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="bg-black/50 border-white/10 rounded-xl h-12 focus:border-white/20 text-sm text-white placeholder:text-white/30"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Security Certificate</label>
                                    <Lock className="w-3 h-3 text-muted-foreground/30" />
                                </div>
                                <div className="relative">
                                    <Input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="bg-black/50 border-white/10 rounded-xl h-12 focus:border-white/20 text-sm pr-10 text-white placeholder:text-white/30"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold rounded-xl transition-all active:scale-[0.98]">
                                    Initialize Access
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </form>

                        <div className="mt-8 flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-[10px] leading-relaxed text-muted-foreground uppercase tracking-wide">
                                Warning: Unauthorized access attempts are logged and reported. Valid credentials required to access core administrative functions.
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-[10px] text-muted-foreground/40 mt-8 uppercase tracking-[0.3em]">
                    HEO Sahyog © 2026 Internal System
                </p>
            </motion.div>
        </div>
    );
};

export default AdminLoginView;
