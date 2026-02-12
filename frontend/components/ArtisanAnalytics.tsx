import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import api from '../services/api';

const COLORS = ['#9a3412', '#c2410c', '#ea580c', '#f97316', '#fb923c'];

interface Stats {
    totalRevenue: number;
    totalOrders: number;
    averageRating: number;
    totalReviews: number;
}

interface MonthlyData {
    name: string;
    revenue: number;
    orders: number;
}

interface PopularProduct {
    _id: string;
    title: string;
    soldCount: number;
    revenue: number;
}

const ArtisanAnalytics: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{
        stats: Stats;
        monthlySales: MonthlyData[];
        popularProducts: PopularProduct[];
    } | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics/artisan');
                setData(res.data);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading || !data) {
        return (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50 animate-pulse">
                <div className="h-48 bg-orange-50/50 rounded-2xl mb-4"></div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-orange-50/50 rounded-2xl"></div>
                    <div className="h-24 bg-orange-50/50 rounded-2xl"></div>
                    <div className="h-24 bg-orange-50/50 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    const { stats, monthlySales, popularProducts } = data;

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-orange-50 shadow-sm">
                    <p className="text-orange-900/40 text-xs font-bold uppercase tracking-wider mb-1">Chiffre d'Affaire</p>
                    <p className="text-2xl font-heritage font-bold text-orange-950">{stats.totalRevenue.toLocaleString()} MAD</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-orange-50 shadow-sm">
                    <p className="text-orange-900/40 text-xs font-bold uppercase tracking-wider mb-1">Commandes</p>
                    <p className="text-2xl font-heritage font-bold text-orange-950">{stats.totalOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-orange-50 shadow-sm">
                    <p className="text-orange-900/40 text-xs font-bold uppercase tracking-wider mb-1">Note Moyenne</p>
                    <p className="text-2xl font-heritage font-bold text-orange-950">{stats.averageRating} ★</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-orange-50 shadow-sm">
                    <p className="text-orange-900/40 text-xs font-bold uppercase tracking-wider mb-1">Avis Clients</p>
                    <p className="text-2xl font-heritage font-bold text-orange-950">{stats.totalReviews}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-3xl border border-orange-50 shadow-sm">
                    <h3 className="text-lg font-heritage font-bold text-orange-950 mb-6">Évolution des Ventes</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlySales}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#9a3412" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#9a3412" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fff7ed" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9a3412', fontSize: 10 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9a3412', fontSize: 10 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(154, 52, 18, 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#9a3412"
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Popular Products */}
                <div className="bg-white p-6 rounded-3xl border border-orange-50 shadow-sm">
                    <h3 className="text-lg font-heritage font-bold text-orange-950 mb-6">Produits Populaires</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={popularProducts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#fff7ed" />
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="title"
                                    axisLine={false}
                                    tickLine={false}
                                    width={100}
                                    tick={{ fill: '#9a3412', fontSize: 10, fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#fff7ed' }}
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(154, 52, 18, 0.1)'
                                    }}
                                />
                                <Bar dataKey="soldCount" radius={[0, 4, 4, 0]}>
                                    {popularProducts.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtisanAnalytics;
