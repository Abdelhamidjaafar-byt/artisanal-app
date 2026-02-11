
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { User } from '../types';
import { useNotification } from '../context/NotificationContext';

const AdminDashboard: React.FC = () => {
    const { showNotification } = useNotification();
    const [stats, setStats] = useState<any>(null);
    const [pendingArtisans, setPendingArtisans] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, pendingRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/pending-artisans')
            ]);
            setStats(statsRes.data);
            setPendingArtisans(pendingRes.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string, approve: boolean) => {
        try {
            await api.patch(`/admin/approve/${id}`, { isApproved: approve });
            setPendingArtisans(prev => prev.filter(a => a.id !== id && (a as any)._id !== id));
            // Refresh stats
            const statsRes = await api.get('/admin/stats');
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error approving artisan:', error);
            showNotification("Erreur lors de l'approbation.", 'error');
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-heritage font-bold text-orange-950 mb-8">Tableau de Bord Administrateur</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {[
                    { label: 'Artisans', value: stats?.artisans, color: 'bg-orange-100 text-orange-700' },
                    { label: 'Clients', value: stats?.clients, color: 'bg-blue-100 text-blue-700' },
                    { label: 'Produits', value: stats?.products, color: 'bg-green-100 text-green-700' },
                    { label: 'Commandes', value: stats?.orders, color: 'bg-purple-100 text-purple-700' }
                ].map((stat, i) => (
                    <div key={i} className={`${stat.color} p-6 rounded-2xl`}>
                        <p className="text-sm font-bold uppercase tracking-wider opacity-70">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value || 0}</p>
                    </div>
                ))}
            </div>

            {/* Pending Approvals */}
            <div className="bg-white rounded-3xl shadow-sm border border-orange-50 p-8">
                <h2 className="text-2xl font-heritage font-bold text-orange-950 mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 bg-orange-700 rounded-full"></span>
                    Artisans en attente d'approbation
                </h2>

                {pendingArtisans.length === 0 ? (
                    <p className="text-orange-800/60 italic">Aucun artisan en attente.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-orange-50 text-left">
                                    <th className="py-4 font-bold text-orange-950">Nom</th>
                                    <th className="py-4 font-bold text-orange-950">Email</th>
                                    <th className="py-4 font-bold text-orange-950">Bio</th>
                                    <th className="py-4 font-bold text-orange-950">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingArtisans.map((artisan: any) => (
                                    <tr key={artisan._id || artisan.id} className="border-b border-orange-50 hover:bg-orange-50/30 transition">
                                        <td className="py-4">
                                            <div className="font-bold text-orange-900">{artisan.name}</div>
                                        </td>
                                        <td className="py-4 text-orange-800/70">{artisan.email}</td>
                                        <td className="py-4 text-orange-800/70 max-w-xs truncate">{artisan.bio || 'Aucune bio'}</td>
                                        <td className="py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApprove(artisan._id || artisan.id, true)}
                                                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition"
                                                >
                                                    Approuver
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(artisan._id || artisan.id, false)}
                                                    className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200 transition"
                                                >
                                                    Rejeter
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
