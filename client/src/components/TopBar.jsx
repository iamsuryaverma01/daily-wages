import React from 'react';
import { LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

const TopBar = () => {
    const { user, logout } = useAuth();

    return (
        <div className="h-20 flex items-center justify-between px-10 glass-nav sticky top-0 z-50">
            {/* Logo placeholder if needed or just empty space */}
            <div className="flex-1">
                <h1 className="text-xl font-black text-[var(--primary)] uppercase tracking-tighter">Daily Wages</h1>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                <LanguageSwitcher />

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">{user?.name || 'User'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role || 'User'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border-2 border-white shadow-sm">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=5A4FCF&color=fff`}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Top-Right Logout Button */}
                <button
                    onClick={logout}
                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors shadow-sm border border-red-100/50 flex items-center gap-2 group"
                >
                    <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default TopBar;
