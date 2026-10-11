import React from 'react';
import { MapPin, RefreshCw, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import usePincode from '../hooks/usePincode';

const LocationDisplay = ({ pincode, variant = 'compact' }) => {
    const { t } = useTranslation();
    const { locationData, loading, error } = usePincode(pincode);

    if (variant === 'worker-card') {
        return (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-400">
                    <MapPin size={16} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-800 tracking-wider leading-none mb-1">{pincode}</span>
                    <AnimatePresence>
                        {locationData && (
                            <motion.span
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-xs font-black text-emerald-500 uppercase tracking-tighter"
                            >
                                {locationData.placeName}
                            </motion.span>
                        )}
                        {loading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1">
                                <RefreshCw className="animate-spin text-slate-300" size={10} />
                                <span className="text-[10px] text-slate-300">Loading...</span>
                            </motion.div>
                        )}
                        {error && (
                            <span className="text-[10px] text-red-300">Invalid Pincode</span>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    // Default compact variant (used in job cards)
    return (
        <div className="flex items-center gap-2 group">
            <MapPin size={16} className="text-orange-400 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col items-start md:items-end">
                <span className="font-black text-slate-500 text-sm tracking-widest leading-none">{pincode}</span>
                <AnimatePresence>
                    {locationData && (
                        <motion.span
                            initial={{ opacity: 0, x: 5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[11px] text-emerald-500 font-black uppercase tracking-tighter leading-none mt-1"
                        >
                            {locationData.placeName}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LocationDisplay;
