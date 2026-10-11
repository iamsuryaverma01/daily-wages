import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Phone, RefreshCw, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(phone, phone, i18n.language);
            navigate('/worker'); // Default to worker, AuthContext/App will redirect if contractor
        } catch (err) {
            setError(err.response?.data?.message || t('error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Ambient Background */}
            <div className="mesh-bg absolute inset-0 -z-10" />

            {/* Top Navigation Bar */}
            <nav className="p-6 flex justify-between items-center relative z-20">
                <Link to="/" className="text-2xl font-black text-gradient flex items-center">
                    <Briefcase className="mr-2 text-primary-400" size={28} />
                    DailyWages
                </Link>
                <LanguageSwitcher />
            </nav>

            <div className="flex-1 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="max-w-xl w-full glass-card p-10 sm:p-12 rounded-[2.5rem] relative z-10 border-4 border-white shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)]"
                >
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                            className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-[0_20px_40px_-5px_rgba(14,165,233,0.4)] relative"
                        >
                            <LogIn className="text-white" size={40} />
                        </motion.div>
                        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">{t('welcome')}</h2>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-6 bg-red-50 border-2 border-red-200 text-red-600 rounded-3xl text-sm flex items-center font-black"
                        >
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-4 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-2">{t('phoneNumber')}</label>
                            <div className="flex items-center space-x-6">
                                <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-primary-50 text-primary-600 rounded-3xl shadow-inner border-2 border-primary-100">
                                    <Phone size={28} strokeWidth={3} />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="input-field py-6 text-2xl tracking-widest"
                                        placeholder="00000 00000"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-7 group relative overflow-hidden text-2xl"
                        >
                            <div className="relative flex justify-center items-center">
                                {loading ? (
                                    <RefreshCw className="animate-spin" size={32} />
                                ) : (
                                    <>
                                        <LogIn size={32} className="mr-4" strokeWidth={3} />
                                        <span>{t('login')}</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="mt-12 pt-10 border-t-4 border-slate-50 text-center">
                        <Link
                            to="/register"
                            className="inline-flex items-center px-12 py-5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-3xl border-2 border-slate-200 font-extrabold uppercase tracking-widest text-sm transition-all shadow-sm"
                        >
                            <Briefcase className="mr-3 text-primary-600" size={24} />
                            {t('register')}
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
