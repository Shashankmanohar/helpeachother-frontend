import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import {
    QrCode,
    CheckCircle2,
    Clock,
    ArrowRight,
    ShieldCheck,
    IndianRupee,
    Loader2,
    XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentPage = () => {
    const { showToast } = useApp();
    const api = useApi();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<string>('pending');
    const [polling, setPolling] = useState(false);

    // Load initial payment status
    useEffect(() => {
        const userJson = localStorage.getItem('heo_user');
        if (userJson) {
            try {
                const user = JSON.parse(userJson);
                if (user.paymentStatus === 'approved') {
                    navigate('/dashboard', { replace: true });
                    return;
                }
                setPaymentStatus(user.paymentStatus || 'pending');
            } catch (e) { }
        }
    }, [navigate]);

    // Poll for approval status when submitted
    useEffect(() => {
        if (paymentStatus !== 'submitted') return;

        setPolling(true);
        const interval = setInterval(async () => {
            try {
                const data = await api.get('/api/user/payment-status');
                if (data.paymentStatus === 'approved') {
                    const userJson = localStorage.getItem('heo_user');
                    if (userJson) {
                        const user = JSON.parse(userJson);
                        user.paymentStatus = 'approved';
                        user.status = 'active';
                        localStorage.setItem('heo_user', JSON.stringify(user));
                    }
                    showToast('Payment approved! Welcome aboard!', 'success');
                    navigate('/dashboard', { replace: true });
                } else if (data.paymentStatus === 'rejected') {
                    setPaymentStatus('rejected');
                    const userJson = localStorage.getItem('heo_user');
                    if (userJson) {
                        const user = JSON.parse(userJson);
                        user.paymentStatus = 'rejected';
                        localStorage.setItem('heo_user', JSON.stringify(user));
                    }
                    showToast('Payment was rejected. Please try again.', 'error');
                }
            } catch (e) {
                // Silently retry
            }
        }, 5000);

        return () => {
            clearInterval(interval);
            setPolling(false);
        };
    }, [paymentStatus]);

    const handlePaymentDone = async () => {
        setLoading(true);
        try {
            const data = await api.post('/api/user/submit-payment');
            showToast(data.message || 'Payment submitted!', 'success');
            if (data.user) {
                localStorage.setItem('heo_user', JSON.stringify(data.user));
            }
            setPaymentStatus('submitted');
        } catch (error) {
            console.error('Payment submit error');
        } finally {
            setLoading(false);
        }
    };

    const handleRetryPayment = () => {
        setPaymentStatus('pending');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Help Each Other Pvt.</h1>
                    <p className="text-muted-foreground mt-2">Complete Your Registration Payment</p>
                </div>

                <div className="glass border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {paymentStatus === 'pending' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            {/* Amount Badge */}
                            <div className="flex justify-center">
                                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-6 py-3">
                                    <IndianRupee className="w-5 h-5 text-emerald-400" />
                                    <span className="text-2xl font-bold text-emerald-400">1,199</span>
                                </div>
                            </div>

                            <p className="text-center text-sm text-muted-foreground">
                                Scan the QR code below to make the payment
                            </p>

                            {/* QR Code Area */}
                            <div className="flex justify-center">
                                <div className="bg-white rounded-2xl p-4 shadow-lg relative">
                                    {/* Generated QR-style pattern */}
                                    <div className="w-48 h-48 relative flex items-center justify-center">
                                        <svg viewBox="0 0 200 200" className="w-full h-full">
                                            {/* QR code pattern */}
                                            {/* Top-left finder */}
                                            <rect x="10" y="10" width="50" height="50" fill="none" stroke="#000" strokeWidth="4"/>
                                            <rect x="18" y="18" width="34" height="34" fill="#000"/>
                                            {/* Top-right finder */}
                                            <rect x="140" y="10" width="50" height="50" fill="none" stroke="#000" strokeWidth="4"/>
                                            <rect x="148" y="18" width="34" height="34" fill="#000"/>
                                            {/* Bottom-left finder */}
                                            <rect x="10" y="140" width="50" height="50" fill="none" stroke="#000" strokeWidth="4"/>
                                            <rect x="18" y="148" width="34" height="34" fill="#000"/>
                                            {/* Data modules - Row patterns */}
                                            {[70, 80, 90, 100, 110, 120].map(y =>
                                                [10, 20, 30, 40, 70, 80, 100, 110, 130, 140, 150, 160, 170, 180].map(x => (
                                                    <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" fill={(x + y) % 20 === 0 ? "#fff" : "#000"} opacity={0.9}/>
                                                ))
                                            )}
                                            {[10, 20, 30, 40, 50].map(y =>
                                                [70, 80, 90, 100, 110, 120].map(x => (
                                                    <rect key={`m-${x}-${y}`} x={x} y={y} width="8" height="8" fill={(x * y) % 16 === 0 ? "#fff" : "#000"} opacity={0.9}/>
                                                ))
                                            )}
                                            {[140, 150, 160, 170, 180].map(y =>
                                                [70, 80, 90, 100, 110, 120].map(x => (
                                                    <rect key={`b-${x}-${y}`} x={x} y={y} width="8" height="8" fill={(x + y) % 18 === 0 ? "#fff" : "#000"} opacity={0.9}/>
                                                ))
                                            )}
                                            {[130, 140, 150, 160, 170, 180].map(y =>
                                                [130, 140, 150, 160, 170, 180].map(x => (
                                                    <rect key={`br-${x}-${y}`} x={x} y={y} width="8" height="8" fill={(x * y) % 14 === 0 ? "#fff" : "#000"} opacity={0.9}/>
                                                ))
                                            )}
                                        </svg>
                                    </div>
                                    <div className="text-center mt-2">
                                        <p className="text-xs font-medium text-gray-500">UPI Payment</p>
                                        <p className="text-sm font-bold text-gray-800">₹1,199</p>
                                    </div>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-primary">1</span>
                                    </div>
                                    <p>Open any UPI app (Google Pay, PhonePe, Paytm)</p>
                                </div>
                                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-primary">2</span>
                                    </div>
                                    <p>Scan the QR code and pay ₹1,199</p>
                                </div>
                                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-primary">3</span>
                                    </div>
                                    <p>Click "Payment Done" after successful payment</p>
                                </div>
                            </div>

                            {/* Payment Done Button */}
                            <Button
                                onClick={handlePaymentDone}
                                disabled={loading}
                                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl group text-base"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        Payment Done
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    )}

                    {paymentStatus === 'submitted' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-6 py-4"
                        >
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/20 mx-auto">
                                <Clock className="w-10 h-10 text-amber-400 animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Payment Under Review</h2>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Your payment of <span className="text-emerald-400 font-semibold">₹1,199</span> has been submitted.
                                    <br />
                                    Waiting for admin approval.
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-white/5 rounded-xl py-3 px-4">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Auto-checking for approval...</span>
                            </div>
                            <div className="pt-2">
                                <p className="text-xs text-muted-foreground">
                                    You'll be automatically redirected once approved.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {paymentStatus === 'rejected' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-6 py-4"
                        >
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/20 mx-auto">
                                <XCircle className="w-10 h-10 text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Payment Rejected</h2>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Your payment was rejected by the admin.
                                    <br />
                                    Please try making the payment again.
                                </p>
                            </div>
                            <Button
                                onClick={handleRetryPayment}
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl"
                            >
                                Try Again
                            </Button>
                        </motion.div>
                    )}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-8">
                    Having trouble? Contact support for assistance.
                </p>
            </motion.div>
        </div>
    );
};

export default PaymentPage;
