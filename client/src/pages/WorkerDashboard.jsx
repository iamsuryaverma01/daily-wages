import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { MapPin, User, RefreshCw, Zap, Phone, Briefcase, Star, ClipboardList, CheckCircle, Clock, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import usePincode from '../hooks/usePincode';
import LocationDisplay from '../components/LocationDisplay';

const statusStyles = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-600', icon: Clock },
    accepted: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle },
    rejected: { bg: 'bg-red-50', text: 'text-red-500', icon: XCircle },
    completed: { bg: 'bg-slate-100', text: 'text-slate-600', icon: Star },
};

const WorkerDashboard = () => {
    const { user, setUser } = useAuth();
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [isError, setIsError] = useState(false);
    const [pincode, setPincode] = useState(user?.pincode || '');
    const { locationData, loading: pincodeLoading, error: pincodeError } = usePincode(pincode);
    const [jobs, setJobs] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [activeTab, setActiveTab] = useState('jobs');
    const [newPhone, setNewPhone] = useState(user?.phone || '');
    const [updateMsg, setUpdateMsg] = useState('');
    const [isUpdateError, setIsUpdateError] = useState(false);
    const [applyingJobId, setApplyingJobId] = useState(null);

    useEffect(() => {
        if (user?.location?.coordinates) {
            fetchNearbyJobs(user.location.coordinates[0], user.location.coordinates[1], i18n.language);
            fetchMyApplications();
        }
    }, [user?.location, i18n.language]);

    useEffect(() => {
        if (activeTab === 'profile') {
            fetchReviews();
            refreshUserProfile();
        }
    }, [activeTab]);

    const fetchNearbyJobs = async (lng, lat, lang) => {
        try {
            const res = await api.get(`/jobs/nearby?lng=${lng}&lat=${lat}&radius=50&lang=${lang}`);
            setJobs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyApplications = async () => {
        try {
            const res = await api.get('/applications/worker/me');
            setMyApplications(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchReviews = async () => {
        const workerId = user?._id || user?.id;
        if (!workerId) return;
        try {
            const res = await api.get(`/applications/reviews/${workerId}`);
            setReviews(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const refreshUserProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleApplyJob = async (jobId) => {
        setApplyingJobId(jobId);
        try {
            await api.post(`/applications/apply/${jobId}`);
            await fetchMyApplications();
        } catch (err) {
            console.error(err);
        } finally {
            setApplyingJobId(null);
        }
    };

    const getApplicationStatus = (jobId) => {
        const app = myApplications.find(a => (a.job?._id || a.job) === jobId);
        return app ? app.status : null;
    };

    const updateLocation = async () => {
        if (!pincode || pincode.length !== 6) {
            setIsError(true);
            setMsg(t('enterPincode'));
            setTimeout(() => setMsg(''), 3000);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`https://api.zippopotam.us/in/${pincode}`);
            if (!response.ok) throw new Error('Invalid pincode');
            const data = await response.json();
            const place = data.places[0];
            const coordinates = [parseFloat(place.longitude), parseFloat(place.latitude)];

            const res = await api.put('/workers/me', { coordinates, pincode });
            setUser(res.data.user);
            setIsError(false);
            setMsg(t('success'));
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            console.error(err);
            setIsError(true);
            setMsg(t('error'));
            setTimeout(() => setMsg(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const updateProfileData = async () => {
        if (!newPhone || newPhone.length < 10) {
            setIsUpdateError(true);
            setUpdateMsg(t('invalidPhone'));
            setTimeout(() => setUpdateMsg(''), 3000);
            return;
        }

        setLoading(true);
        try {
            const res = await api.put('/auth/profile', { phone: newPhone });
            setUser(res.data.user);
            setIsUpdateError(false);
            setUpdateMsg(t('success'));
            setTimeout(() => setUpdateMsg(''), 3000);
        } catch (err) {
            console.error(err);
            setIsUpdateError(true);
            setUpdateMsg(err.response?.data?.message || t('error'));
            setTimeout(() => setUpdateMsg(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const renderStatusBadge = (status) => {
        const style = statusStyles[status] || statusStyles.pending;
        const Icon = style.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
                <Icon size={12} />
                {t(status)}
            </span>
        );
    };

    const renderJobActions = (job) => {
        const status = getApplicationStatus(job._id);

        if (status === 'pending') {
            return (
                <button disabled className="btn-onshop w-full py-3 opacity-60 cursor-not-allowed flex items-center justify-center gap-2">
                    <Clock size={16} /> {t('pending')}
                </button>
            );
        }
        if (status === 'accepted') {
            return (
                <div className="space-y-2">
                    {renderStatusBadge('accepted')}
                    <a href={`tel:${job.contractor?.phone}`} className="btn-onshop w-full py-3 flex items-center justify-center gap-2">
                        <Phone size={16} /> {t('callNow')}
                    </a>
                </div>
            );
        }
        if (status === 'rejected') {
            return renderStatusBadge('rejected');
        }
        if (status === 'completed') {
            return renderStatusBadge('completed');
        }

        return (
            <div className="space-y-2">
                <button
                    onClick={() => handleApplyJob(job._id)}
                    disabled={applyingJobId === job._id}
                    className="btn-onshop w-full py-3 flex items-center justify-center gap-2"
                >
                    {applyingJobId === job._id ? (
                        <RefreshCw className="animate-spin" size={16} />
                    ) : (
                        <Briefcase size={16} />
                    )}
                    {t('apply')}
                </button>
                <a
                    href={`tel:${job.contractor?.phone}`}
                    className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-[var(--primary)] transition-colors"
                >
                    <Phone size={14} /> {t('callNow')}
                </a>
            </div>
        );
    };

    const tabLabels = {
        jobs: t('jobs'),
        applications: t('myApplications'),
        profile: t('myProfile'),
    };

    const pendingCount = myApplications.filter(a => a.status === 'pending').length;
    const acceptedCount = myApplications.filter(a => a.status === 'accepted').length;

    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* Stats Cards */}
                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-6">{t('categories')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: t('nearbyJobs'), count: jobs.length, bg: 'linear-gradient(135deg, #5A4FCF, #7E74D5)', icon: MapPin, tab: 'jobs' },
                            { title: t('myApplications'), count: myApplications.length, bg: 'linear-gradient(135deg, #10B981, #34D399)', icon: ClipboardList, tab: 'applications' },
                            { title: t('workersPortfolio'), label: user?.averageRating > 0 ? `⭐ ${user.averageRating}` : t('noReviews'), bg: 'linear-gradient(135deg, #F97316, #FB923C)', icon: Star, tab: 'profile' },
                        ].map((cat, i) => (
                            <div
                                key={i}
                                style={{ background: cat.bg }}
                                className="h-36 rounded-[2rem] p-8 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer shadow-lg"
                                onClick={() => setActiveTab(cat.tab)}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                                <cat.icon size={36} className="mb-3 text-white/40" />
                                <p className="text-xs font-bold text-white/70 uppercase tracking-widest">{cat.title}</p>
                                <h3 className="text-2xl font-black">{cat.count ?? cat.label}</h3>
                                {cat.tab === 'applications' && acceptedCount > 0 && (
                                    <span className="absolute top-4 right-4 bg-white/20 text-white text-[10px] font-black px-2 py-1 rounded-full">
                                        {acceptedCount} {t('accepted')}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Main Section */}
                <section>
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                        <h2 className="text-xl font-bold text-slate-800">{tabLabels[activeTab]}</h2>
                        <div className="flex gap-2 flex-wrap">
                            {['jobs', 'applications', 'profile'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-[var(--primary)] text-white' : 'bg-white text-slate-400'}`}
                                >
                                    {tabLabels[tab]}
                                    {tab === 'applications' && pendingCount > 0 && (
                                        <span className="ml-1.5 bg-amber-400 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                            {pendingCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' ? (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                {/* Profile Header with Rating */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="onshop-card flex flex-col items-center text-center py-10">
                                        <div className="w-24 h-24 bg-[var(--primary)] rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-200">
                                            <User size={48} className="text-white" />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-800 mb-1">{user?.name}</h3>
                                        <p className="text-slate-400 font-bold mb-4">{user?.phone}</p>
                                        <div className="bg-slate-50 px-6 py-2 rounded-full border border-slate-100 flex items-center gap-2 mb-4">
                                            <MapPin size={16} className="text-[var(--primary)]" />
                                            <span className="text-sm font-bold text-slate-500">{user?.pincode}</span>
                                        </div>
                                        {user?.workTypes?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 justify-center mb-4">
                                                {user.workTypes.map(trade => (
                                                    <span key={trade} className="bg-indigo-50 text-[var(--primary)] px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                                                        {t(trade)}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100">
                                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">{t('averageRating')}</p>
                                            <p className="text-3xl font-black text-amber-500">
                                                {user?.totalRatings > 0 ? `⭐ ${user.averageRating}` : t('noReviews')}
                                            </p>
                                            {user?.totalRatings > 0 && (
                                                <p className="text-xs text-slate-400 font-medium mt-1">
                                                    ({user.totalRatings} {t('totalRatings')})
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Update Location */}
                                    <div className="onshop-card">
                                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
                                                <MapPin size={18} />
                                            </div>
                                            {t('updateLocation')}
                                        </h3>
                                        <div className="space-y-6">
                                            <input
                                                type="text"
                                                maxLength="6"
                                                placeholder={t('enterPincode')}
                                                value={pincode}
                                                onChange={(e) => setPincode(e.target.value)}
                                                className="input-onshop text-center text-2xl font-black tracking-widest py-5"
                                            />
                                            <AnimatePresence>
                                                {(pincodeLoading || locationData || pincodeError) && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="text-center"
                                                    >
                                                        {pincodeLoading && (
                                                            <div className="flex items-center justify-center text-xs font-bold text-slate-400">
                                                                <RefreshCw className="animate-spin mr-2" size={12} />
                                                                {t('fetchingLocation')}
                                                            </div>
                                                        )}
                                                        {locationData && (
                                                            <div className="flex items-center justify-center text-lg font-black text-emerald-500">
                                                                <CheckCircle className="mr-2" size={20} />
                                                                {locationData.placeName}, {locationData.state}
                                                            </div>
                                                        )}
                                                        {pincodeError && (
                                                            <div className="flex items-center justify-center text-xs font-bold text-red-400">
                                                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2" />
                                                                {t('invalidPincode')}
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <button onClick={updateLocation} disabled={loading} className="btn-onshop w-full py-4 text-lg">
                                                {loading ? <RefreshCw className="animate-spin" size={24} /> : <RefreshCw size={24} />}
                                                {t('updateLocation')}
                                            </button>
                                            {msg && (
                                                <p className={`text-center font-bold ${isError ? 'text-red-500' : 'text-green-500'}`}>{msg}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Update Phone */}
                                <div className="onshop-card">
                                    <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500">
                                            <Phone size={18} />
                                        </div>
                                        {t('updatePhone')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{t('newPhoneNumber')}</label>
                                            <input
                                                type="tel"
                                                placeholder={t('newPhoneNumber')}
                                                value={newPhone}
                                                onChange={(e) => setNewPhone(e.target.value)}
                                                className="input-onshop"
                                            />
                                        </div>
                                        <button onClick={updateProfileData} disabled={loading} className="btn-onshop py-4">
                                            {loading ? <RefreshCw className="animate-spin" size={24} /> : <Zap size={24} />}
                                            {t('updatePhone')}
                                        </button>
                                    </div>
                                    {updateMsg && (
                                        <p className={`text-center mt-4 font-bold ${isUpdateError ? 'text-red-500' : 'text-green-500'}`}>{updateMsg}</p>
                                    )}
                                </div>

                                {/* Reviews & Feedback Portfolio */}
                                <div className="onshop-card">
                                    <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-500">
                                            <Star size={18} />
                                        </div>
                                        {t('notifications')}
                                    </h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6 ml-11">{t('workersPortfolio')}</p>

                                    {reviews.length > 0 ? (
                                        <div className="space-y-4">
                                            {reviews.map((rev) => (
                                                <div key={rev._id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-slate-700">{rev.contractor?.name}</span>
                                                        <span className="text-amber-500 font-bold text-sm">⭐ {rev.rating}/5</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">{rev.job?.title}</p>
                                                    {rev.feedback ? (
                                                        <p className="text-sm text-slate-600 font-medium bg-white p-3 rounded-xl border border-slate-100">{rev.feedback}</p>
                                                    ) : (
                                                        <p className="text-xs text-slate-300 font-medium italic">{t('noReviews')}</p>
                                                    )}
                                                    <p className="text-[10px] text-slate-400 font-medium text-right">
                                                        {new Date(rev.completedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <Star size={40} className="mx-auto text-slate-200 mb-3" />
                                            <p className="text-slate-400 font-bold">{t('noReviews')}</p>
                                            <p className="text-xs text-slate-300 mt-1">{t('howIsWorkerWorking')}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : activeTab === 'applications' ? (
                            <motion.div
                                key="applications"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-4"
                            >
                                {myApplications.length > 0 ? myApplications.map((app) => (
                                    <motion.div
                                        key={app._id}
                                        whileHover={{ y: -2 }}
                                        className="onshop-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                                    >
                                        <div className="flex-1">
                                            <h3 className="text-lg font-black text-slate-800 mb-1">{app.job?.title}</h3>
                                            <p className="text-sm text-slate-500 font-medium line-clamp-1 mb-2">{app.job?.description}</p>
                                            <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
                                                <span className="flex items-center gap-1">
                                                    <User size={12} /> {app.contractor?.name}
                                                </span>
                                                <LocationDisplay pincode={app.job?.pincode} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {renderStatusBadge(app.status)}
                                            {app.status === 'accepted' && (
                                                <a
                                                    href={`tel:${app.contractor?.phone}`}
                                                    className="btn-onshop px-4 py-2 text-xs flex items-center gap-2"
                                                >
                                                    <Phone size={14} /> {t('callNow')}
                                                </a>
                                            )}
                                            {app.status === 'completed' && app.rating && (
                                                <span className="text-amber-500 font-bold text-sm">⭐ {app.rating}/5</span>
                                            )}
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="py-20 text-center onshop-card bg-slate-50/50 border-dashed border-2">
                                        <ClipboardList size={40} className="mx-auto text-slate-300 mb-3" />
                                        <p className="text-slate-400 font-bold">{t('myApplications')}</p>
                                        <p className="text-xs text-slate-300 mt-1">{t('noApplicationsYet')}</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="jobs"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {jobs.length > 0 ? jobs.map((job) => (
                                    <motion.div
                                        key={job._id}
                                        whileHover={{ y: -5 }}
                                        className="onshop-card relative group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-black text-slate-800 line-clamp-1">{job.title}</h3>
                                            <p className="text-[var(--primary)] font-black">{t('daily')}</p>
                                        </div>

                                        <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">
                                            <div className="flex items-center gap-1">
                                                <User size={14} className="text-[var(--primary-light)]" />
                                                {job.contractor?.name}
                                            </div>
                                            <LocationDisplay pincode={job.pincode} />
                                        </div>

                                        <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-6 h-10">{job.description}</p>

                                        {renderJobActions(job)}
                                    </motion.div>
                                )) : (
                                    <div className="col-span-full py-20 text-center onshop-card bg-slate-50/50 border-dashed border-2">
                                        <p className="text-slate-400 font-bold">{t('noJobsFound')}</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </div>
        </DashboardLayout>
    );
};

export default WorkerDashboard;
