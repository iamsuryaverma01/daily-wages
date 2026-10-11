import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home,
    LayoutGrid,
    Wallet,
    ShoppingCart,
    User,
    Settings,
    LogOut,
    ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const { t } = useTranslation();

    const navItems = [
        { icon: Home, label: t('home') || 'Home', path: user?.role === 'contractor' ? '/contractor' : '/worker' },
        { icon: LayoutGrid, label: t('categories') || 'Categories', path: '#' },
        { icon: Wallet, label: t('wallet') || 'Wallet', path: '#' },
        { icon: ShoppingCart, label: t('cart') || 'Cart', path: '#' },
        { icon: User, label: t('userProfile') || 'User Profile', path: '#' },
        { icon: Settings, label: t('settings') || 'Settings', path: '#' },
    ];

    return (
        <div className="w-[var(--sidebar-width)] h-screen bg-[var(--bg-sidebar)] text-white flex flex-col fixed left-0 top-0 z-[100] rounded-r-[3rem] shadow-2xl overflow-hidden">
            {/* Logo */}
            <div className="p-8 pb-12 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <ShoppingBag size={24} className="text-white" />
                </div>
                <span className="text-2xl font-black tracking-tight">Daily Wages</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) => `
              flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group
              ${isActive ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}
            `}
                    >
                        <item.icon size={22} className="group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-8">
                <button
                    onClick={logout}
                    className="flex items-center gap-4 px-6 py-4 w-full text-white/60 hover:text-white transition-colors group"
                >
                    <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
                    <span className="font-semibold uppercase tracking-widest text-xs">{t('logout')}</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
