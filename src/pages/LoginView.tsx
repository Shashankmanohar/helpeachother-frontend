import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import {
    User,
    Mail,
    Lock,
    ArrowRight,
    ShieldCheck,
    UserPlus,
    LogIn,
    Eye,
    EyeOff,
    Briefcase
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LoginView = () => {
    // UPDATED BRANDING: HEO Sahyog
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        userName: '',
        name: '',
        email: '',
        password: '',
        referralCode: ''
    });

    const { showToast } = useApp();
    const api = useApi();

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            setFormData(prev => ({ ...prev, referralCode: ref }));
            if (isLogin) {
                setIsLogin(false); // Switch to registration if ref code is present
            }
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const endpoint = isLogin ? '/api/user/login' : '/api/user/register';
        const body = isLogin
            ? { identifier: formData.email, password: formData.password }
            : {
                userName: formData.userName,
                name: formData.name,
                email: formData.email,
                password: formData.password,
                referredBy: formData.referralCode
            };

        try {
            const data = await api.post(endpoint, body);

            showToast(data.message || 'Success!', 'success');

            if (data.token) {
                localStorage.setItem('heo_token', data.token);
                localStorage.setItem('heo_user', JSON.stringify(data.user));

                // Check payment status - redirect to payment page if not approved
                if (data.user?.paymentStatus && data.user.paymentStatus !== 'approved') {
                    window.location.href = '/payment';
                } else {
                    window.location.href = '/dashboard';
                }
            } else if (!isLogin) {
                setIsLogin(true);
                showToast('Registration successful! Please login.', 'success');
            }
        } catch (error) {
            // Error is already handled by useApi toast
            console.error('Auth error handled by hook');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight uppercase">HEO Sahyog</h1>
                    <p className="text-muted-foreground mt-2">Empowering Growth through Collaboration</p>
                </div>

                <div className="glass border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="flex bg-white/5 p-1 rounded-xl mb-8">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    key="signup-fields"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4 overflow-hidden"
                                >
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground ml-1">Username</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                name="userName"
                                                placeholder="john_doe"
                                                value={formData.userName}
                                                onChange={handleInputChange}
                                                className="bg-white/5 border-white/10 pl-10 h-11 focus:border-primary/50"
                                                required={!isLogin}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground ml-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                name="name"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="bg-white/5 border-white/10 pl-10 h-11 focus:border-primary/50"
                                                required={!isLogin}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground ml-1">Referral Code (Optional)</label>
                                        <div className="relative">
                                            <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                name="referralCode"
                                                placeholder="HEO-XXXXXX"
                                                value={formData.referralCode}
                                                onChange={handleInputChange}
                                                className="bg-white/5 border-white/10 pl-10 h-11 focus:border-primary/50"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground ml-1">
                                {isLogin ? "Email or Username" : "Email Address"}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    name="email"
                                    type={isLogin ? "text" : "email"}
                                    placeholder={isLogin ? "john_doe or name@example.com" : "name@example.com"}
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="bg-white/5 border-white/10 pl-10 h-11 focus:border-primary/50"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="bg-white/5 border-white/10 pl-10 h-11 focus:border-primary/50"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {isLogin && (
                            <div className="flex justify-end">
                                <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl mt-6 group">
                            {isLogin ? 'Login Now' : 'Create Account'}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-sm text-muted-foreground">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-white font-semibold hover:text-primary transition-colors"
                            >
                                {isLogin ? 'Sign Up' : 'Login'}
                            </button>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-8">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>

                <div className="mt-8 text-center border-t border-white/5 pt-6">
                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em] font-medium">
                        Developed by <a href="https://webfloratechnologies.com" target="_blank" rel="noopener noreferrer" className="inline-block text-white/80 hover:text-blue-500 hover:scale-105 transition-all duration-200 font-bold">Webflora Technologies</a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginView;
