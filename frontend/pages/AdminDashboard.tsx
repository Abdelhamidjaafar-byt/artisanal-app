
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { User, UserRole } from '../types';
import { useNotification } from '../context/NotificationContext';
import { usePopup } from '../context/PopupContext';
import { Trash2, Shield, User as UserIcon, CheckCircle, XCircle, Package } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const { showNotification } = useNotification();
    const { showConfirm } = usePopup();
    const [stats, setStats] = useState<any>(null);
    const [pendingArtisans, setPendingArtisans] = useState<User[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'approvals' | 'users' | 'products' | 'orders'>('approvals');
    const [userRoleFilter, setUserRoleFilter] = useState<UserRole | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const USERS_PER_PAGE = 10;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, pendingRes, usersRes, productsRes, ordersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/pending-artisans'),
                api.get('/admin/users'),
                api.get('/products'),
                api.get('/orders') // Assuming this endpoint exists based on stats
            ]);
            setStats(statsRes.data);
            setPendingArtisans(pendingRes.data);
            setUsers(usersRes.data);
            setProducts(productsRes.data.products || productsRes.data);
            setOrders(ordersRes.data || []);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            showNotification("Erreur lors du chargement des données.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string, approve: boolean) => {
        try {
            await api.patch(`/admin/approve/${id}`, { isApproved: approve });
            setPendingArtisans(prev => prev.filter(a => a.id !== id && (a as any)._id !== id));
            showNotification(approve ? "Artisan approuvé !" : "Artisan rejeté.", 'success');
            // Refresh stats and users
            const [statsRes, usersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error('Error approving artisan:', error);
            showNotification("Erreur lors de l'approbation.", 'error');
        }
    };

    const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/orders/${id}/status`, { status: newStatus });
            setOrders(prev => prev.map(o => ((o._id === id || o.id === id) ? { ...o, status: newStatus } : o)));
            showNotification("Statut de la commande mis à jour.", 'success');
        } catch (error) {
            console.error('Error updating order status:', error);
            showNotification("Erreur lors de la mise à jour du statut.", 'error');
        }
    };

    const handleDeleteUser = async (id: string) => {
        const confirmed = await showConfirm(
            "Confirmation de suppression",
            "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
        );
        if (!confirmed) return;

        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(prev => prev.filter(u => (u as any)._id !== id && u.id !== id));
            setPendingArtisans(prev => prev.filter(a => (a as any)._id !== id && a.id !== id));
            showNotification("Utilisateur supprimé avec succès.", 'success');

            // Refresh stats
            const statsRes = await api.get('/admin/stats');
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error deleting user:', error);
            showNotification("Erreur lors de la suppression.", 'error');
        }
    };

    const handleUpdateRole = async (id: string, newRole: string) => {
        try {
            await api.patch(`/admin/users/${id}/role`, { role: [newRole] });
            setUsers(prev => prev.map(u => ((u as any)._id === id || u.id === id) ? { ...u, role: [newRole as UserRole] } : u));
            showNotification("Rôle mis à jour.", 'success');

            // Refresh stats
            const statsRes = await api.get('/admin/stats');
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error updating role:', error);
            showNotification("Erreur lors de la mise à jour du rôle.", 'error');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        const confirmed = await showConfirm(
            "Supprimer le produit",
            "Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
        );
        if (!confirmed) return;

        try {
            await api.delete(`/products/${id}`);
            setProducts(prev => prev.filter(p => (p._id !== id && p.id !== id)));
            showNotification("Produit supprimé avec succès.", 'success');

            // Refresh stats
            const statsRes = await api.get('/admin/stats');
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error deleting product:', error);
            showNotification("Erreur lors de la suppression du produit.", 'error');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-700 rounded-full animate-spin"></div>
            <p className="text-orange-900 font-medium">Chargement du tableau de bord...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-heritage font-bold text-orange-950">Tableau de Bord Administrateur</h1>
                <div className="flex bg-orange-50 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('approvals')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'approvals' ? 'bg-white text-orange-700 shadow-sm' : 'text-orange-900/60 hover:text-orange-900'}`}
                    >
                        Approbations ({pendingArtisans.length})
                    </button>
                    <button
                        onClick={() => { setActiveTab('users'); setUserRoleFilter(null); setCurrentPage(1); }}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'users' && !userRoleFilter ? 'bg-white text-orange-700 shadow-sm' : 'text-orange-900/60 hover:text-orange-900'}`}
                    >
                        Gestion Utilisateurs
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'products' ? 'bg-white text-orange-700 shadow-sm' : 'text-orange-900/60 hover:text-orange-900'}`}
                    >
                        Gestion Produits
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'orders' ? 'bg-white text-orange-700 shadow-sm' : 'text-orange-900/60 hover:text-orange-900'}`}
                    >
                        Commandes
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
                {[
                    { label: 'Total Utilisateurs', value: users.length, color: 'bg-gray-100 text-gray-700', icon: UserIcon, tab: 'users', role: null },
                    { label: 'Artisans', value: stats?.artisans, color: 'bg-orange-100 text-orange-700', icon: Shield, tab: 'users', role: UserRole.ARTISAN },
                    { label: 'Clients', value: stats?.clients, color: 'bg-blue-100 text-blue-700', icon: UserIcon, tab: 'users', role: UserRole.CLIENT },
                    { label: 'Produits', value: stats?.products, color: 'bg-green-100 text-green-700', icon: Shield, tab: 'products' },
                    { label: 'Commandes', value: stats?.orders, color: 'bg-purple-100 text-purple-700', icon: Shield, tab: 'orders' }
                ].map((stat, i) => (
                    <div key={i} className={`${stat.color} p-6 rounded-2xl relative overflow-hidden group transition-all hover:shadow-lg`}>
                        <div className="relative z-10">
                            <p className="text-sm font-bold uppercase tracking-wider opacity-70">{stat.label}</p>
                            <p className="text-3xl font-bold mt-1">{stat.value || 0}</p>

                            <button
                                onClick={() => {
                                    setActiveTab(stat.tab as any);
                                    if (stat.role !== undefined) setUserRoleFilter(stat.role as UserRole);
                                    else setUserRoleFilter(null);
                                    setCurrentPage(1);
                                }}
                                className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/50 hover:bg-white px-3 py-1.5 rounded-lg transition-colors"
                            >
                                Gérer
                                <span className="text-lg">→</span>
                            </button>
                        </div>
                        <stat.icon className="absolute right-[-10%] bottom-[-10%] w-24 h-24 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                    </div>
                ))}
            </div>

            {activeTab === 'approvals' ? (
                /* Pending Approvals Section */
                <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-8">
                    <h2 className="text-2xl font-heritage font-bold text-orange-950 mb-6 flex items-center gap-3">
                        <span className="w-2 h-8 bg-orange-700 rounded-full"></span>
                        Artisans en attente d'approbation
                    </h2>

                    {pendingArtisans.length === 0 ? (
                        <div className="text-center py-12 bg-orange-50/30 rounded-2xl border border-dashed border-orange-200">
                            <CheckCircle className="w-12 h-12 text-orange-300 mx-auto mb-3" />
                            <p className="text-orange-800/60 italic font-medium">Tout est à jour ! Aucun artisan en attente.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-orange-50 text-left">
                                        <th className="py-4 px-2 font-bold text-orange-950">Nom</th>
                                        <th className="py-4 px-2 font-bold text-orange-950">Email</th>
                                        <th className="py-4 px-2 font-bold text-orange-950">Bio</th>
                                        <th className="py-4 px-2 font-bold text-orange-950 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const paginatedApprovals = pendingArtisans.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);
                                        return paginatedApprovals.map((artisan: any) => (
                                            <tr key={artisan._id || artisan.id} className="border-b border-orange-50 hover:bg-orange-50/30 transition">
                                                <td className="py-4 px-2">
                                                    <div className="font-bold text-orange-900">{artisan.name}</div>
                                                </td>
                                                <td className="py-4 px-2 text-orange-800/70">{artisan.email}</td>
                                                <td className="py-4 px-2 text-orange-800/70 max-w-xs truncate">{artisan.bio || 'Aucune bio'}</td>
                                                <td className="py-4 px-2">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleApprove(artisan._id || artisan.id, true)}
                                                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition flex items-center gap-2"
                                                        >
                                                            <CheckCircle className="w-4 h-4" /> Approuver
                                                        </button>
                                                        <button
                                                            onClick={() => handleApprove(artisan._id || artisan.id, false)}
                                                            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200 transition flex items-center gap-2"
                                                        >
                                                            <XCircle className="w-4 h-4" /> Rejeter
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ));
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Controls for Approvals */}
                    {(() => {
                        const totalPages = Math.ceil(pendingArtisans.length / USERS_PER_PAGE);
                        if (totalPages <= 1) return null;
                        return (
                            <div className="mt-8 flex items-center justify-center gap-2">
                                <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-lg text-sm font-bold text-orange-950/60 hover:bg-orange-50 disabled:opacity-30 transition">Précédent</button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-orange-950 text-white shadow-md' : 'text-orange-950/60 hover:bg-orange-50'}`}>{i + 1}</button>
                                ))}
                                <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg text-sm font-bold text-orange-950/60 hover:bg-orange-50 disabled:opacity-30 transition">Suivant</button>
                            </div>
                        );
                    })()}
                </div>
            ) : activeTab === 'users' ? (
                /* User Management Section */
                <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h2 className="text-2xl font-heritage font-bold text-orange-950 flex items-center gap-3">
                            <span className="w-2 h-8 bg-blue-700 rounded-full"></span>
                            {userRoleFilter ? `Liste des ${userRoleFilter === UserRole.CLIENT ? 'Clients' : 'Artisans'}` : 'Liste des Utilisateurs'}
                        </h2>
                        {userRoleFilter && (
                            <button
                                onClick={() => setUserRoleFilter(null)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full transition"
                            >
                                Afficher tous les utilisateurs &times;
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-orange-50 text-left">
                                    <th className="py-4 px-2 font-bold text-orange-950">Utilisateur</th>
                                    <th className="py-4 px-2 font-bold text-orange-950">Rôle</th>
                                    <th className="py-4 px-2 font-bold text-orange-950">Statut</th>
                                    <th className="py-4 px-2 font-bold text-orange-950 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const filteredUsers = users.filter(u => !userRoleFilter || u.role.includes(userRoleFilter));
                                    const paginatedUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

                                    return paginatedUsers.map((user: any) => (
                                        <tr key={user._id || user.id} className="border-b border-orange-50 hover:bg-orange-50/30 transition">
                                            <td className="py-4 px-2">
                                                <div className="font-bold text-orange-900">{user.name}</div>
                                                <div className="text-xs text-orange-800/60">{user.email}</div>
                                            </td>
                                            <td className="py-4 px-2">
                                                <select
                                                    value={user.role[0]}
                                                    onChange={(e) => handleUpdateRole(user._id || user.id, e.target.value)}
                                                    className="bg-orange-50 text-orange-900 text-sm font-bold rounded-lg border-none focus:ring-2 focus:ring-orange-200 py-1 px-2 cursor-pointer"
                                                >
                                                    <option value="CLIENT">Client</option>
                                                    <option value="ARTISAN">Artisan</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            </td>
                                            <td className="py-4 px-2 text-sm">
                                                {user.isApproved ? (
                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold text-[10px] uppercase">Approuvé</span>
                                                ) : (
                                                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold text-[10px] uppercase">En attente / Non approuvé</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-2 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(user._id || user.id)}
                                                    className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                                    title="Supprimer l'utilisateur"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {(() => {
                        const filteredUsers = users.filter(u => !userRoleFilter || u.role.includes(userRoleFilter));
                        const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
                        if (totalPages <= 1) return null;

                        return (
                            <div className="mt-8 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg text-sm font-bold text-orange-950/60 hover:bg-orange-50 disabled:opacity-30 disabled:hover:bg-transparent transition"
                                >
                                    Précédent
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-orange-950 text-white shadow-md' : 'text-orange-950/60 hover:bg-orange-50'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg text-sm font-bold text-orange-950/60 hover:bg-orange-50 disabled:opacity-30 disabled:hover:bg-transparent transition"
                                >
                                    Suivant
                                </button>
                            </div>
                        );
                    })()}
                </div>
            ) : activeTab === 'products' ? (
                /* Product Management Section */
                <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-8">
                    <h2 className="text-2xl font-heritage font-bold text-orange-950 mb-6 flex items-center gap-3">
                        <span className="w-2 h-8 bg-green-700 rounded-full"></span>
                        Gestion du Catalogue Global
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-orange-50 text-left">
                                    <th className="py-4 px-2 font-bold text-orange-950">Produit</th>
                                    <th className="py-4 px-2 font-bold text-orange-950">Artisan</th>
                                    <th className="py-4 px-2 font-bold text-orange-950">Prix</th>
                                    <th className="py-4 px-2 font-bold text-orange-950">Catégorie</th>
                                    <th className="py-4 px-2 font-bold text-orange-950 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const paginatedProducts = products.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);
                                    return paginatedProducts.map((prod: any) => (
                                        <tr key={prod._id || prod.id} className="border-b border-orange-50 hover:bg-orange-50/30 transition">
                                            <td className="py-4 px-2">
                                                <div className="font-bold text-orange-900">{prod.title}</div>
                                                <div className="text-xs text-orange-800/60">ID: {prod._id?.slice(-8)}</div>
                                            </td>
                                            <td className="py-4 px-2">
                                                <div className="text-orange-900">{prod.artisan?.name || 'Inconnu'}</div>
                                                <div className="text-xs text-orange-800/60">{prod.artisan?.email}</div>
                                            </td>
                                            <td className="py-4 px-2 font-bold text-orange-700">{prod.price} MAD</td>
                                            <td className="py-4 px-2">
                                                <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{prod.category}</span>
                                            </td>
                                            <td className="py-4 px-2">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleDeleteProduct(prod._id || prod.id)}
                                                        className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                                        title="Supprimer le produit"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls for Products */}
                    {(() => {
                        const totalPages = Math.ceil(products.length / USERS_PER_PAGE);
                        if (totalPages <= 1) return null;
                        return (
                            <div className="mt-8 flex items-center justify-center gap-2">
                                <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-lg text-sm font-bold text-orange-950/60 hover:bg-orange-50 disabled:opacity-30 transition">Précédent</button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-orange-950 text-white shadow-md' : 'text-orange-950/60 hover:bg-orange-50'}`}>{i + 1}</button>
                                ))}
                                <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg text-sm font-bold text-orange-950/60 hover:bg-orange-50 disabled:opacity-30 transition">Suivant</button>
                            </div>
                        );
                    })()}
                </div>
            ) : (
                /* Orders Management Section */
                <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-8">
                    <h2 className="text-2xl font-heritage font-bold text-orange-950 mb-6 flex items-center gap-3">
                        <span className="w-2 h-8 bg-purple-700 rounded-full"></span>
                        Suivi des Commandes Globales
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-orange-50 text-orange-950/40 text-sm uppercase tracking-wider">
                                    <th className="pb-4 font-bold">Commande</th>
                                    <th className="pb-4 font-bold">Client</th>
                                    <th className="pb-4 font-bold">Artisan</th>
                                    <th className="pb-4 font-bold">Total</th>
                                    <th className="pb-4 font-bold">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-50">
                                {(() => {
                                    const paginatedOrders = orders.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);
                                    return paginatedOrders.map((order: any) => (
                                        <tr key={order._id || order.id} className="hover:bg-orange-50/30 transition">
                                            <td className="py-4">
                                                <div className="font-bold text-orange-950">#{order._id?.slice(-6).toUpperCase()}</div>
                                                <div className="text-xs text-orange-600">{order.items?.length || 0} article(s)</div>
                                            </td>
                                            <td className="py-4 font-medium text-orange-900">{order.client?.name || 'Inconnu'}</td>
                                            <td className="py-4 font-medium text-orange-800">{order.artisan?.name || 'Inconnu'}</td>
                                            <td className="py-4 font-bold text-orange-950">{order.totalAmount || 0} MAD</td>
                                            <td className="py-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateOrderStatus(order._id || order.id, e.target.value)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border-none focus:ring-2 focus:ring-orange-200 cursor-pointer ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                                            order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-orange-50 text-orange-800'
                                                        }`}
                                                >
                                                    <option value="IN_CART">Panier</option>
                                                    <option value="PENDING">En attente</option>
                                                    <option value="IN_FABRICATION">En fabrication</option>
                                                    <option value="FINISHED">Terminé</option>
                                                    <option value="PAID">Payé</option>
                                                    <option value="SHIPPED">Expédié</option>
                                                    <option value="DELIVERED">Livré</option>
                                                    <option value="CANCELLED">Annulé</option>
                                                    <option value="REFUNDED">Remboursé</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>

                        {/* Pagination Controls for Orders */}
                        {(() => {
                            const totalPages = Math.ceil(orders.length / USERS_PER_PAGE);
                            if (totalPages <= 1) return null;
                            return (
                                <div className="mt-8 flex items-center justify-center gap-2">
                                    <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-lg text-sm font-bold text-orange-950/60 hover:bg-orange-50 disabled:opacity-30 transition">Précédent</button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-orange-950 text-white shadow-md' : 'text-orange-950/60 hover:bg-orange-50'}`}>{i + 1}</button>
                                    ))}
                                    <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg text-sm font-bold text-orange-950/60 hover:bg-orange-50 disabled:opacity-30 transition">Suivant</button>
                                </div>
                            );
                        })()}
                        {orders.length === 0 && (
                            <div className="text-center py-12 text-orange-800/60 italic font-medium">
                                Aucune commande enregistrée.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
