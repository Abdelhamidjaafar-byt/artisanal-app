
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, OrderStatus } from '../types';
import { MOCK_ORDERS, MOCK_PRODUCTS, CRAFT_CATEGORIES } from '../constants';
import { generateProductDescription, getArtisanAdvisorResponse } from '../geminiService';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: '', category: CRAFT_CATEGORIES[0], price: 0, description: '' });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');
  const [query, setQuery] = useState('');

  if (!user) return <div className="p-10 text-center">Chargement...</div>;

  const handleGenerateDescription = async () => {
    if (!newProduct.title) return;
    setAiLoading(true);
    const desc = await generateProductDescription(newProduct.title, newProduct.category);
    setNewProduct({ ...newProduct, description: desc });
    setAiLoading(false);
  };

  const handleAskAi = async () => {
    if (!query) return;
    setAiAdvice('L\'expert réfléchit...');
    const response = await getArtisanAdvisorResponse(query, `Artisan ${user.name} spécialisé en ${user.craftType} à ${user.region}.`);
    setAiAdvice(response);
  };

  const StatusBadge = ({ status }: { status: OrderStatus }) => {
    const styles = {
      [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [OrderStatus.MANUFACTURING]: 'bg-blue-100 text-blue-800',
      [OrderStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [OrderStatus.DELIVERED]: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status]}`}>{status}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-heritage font-bold text-orange-950 mb-2">Bienvenue, {user.name}</h1>
          <p className="text-orange-800/60 font-medium">Tableau de bord {user.role.toLowerCase()}</p>
        </div>
        <div className="flex gap-4">
          {user.role === UserRole.ARTISAN && (
            <>
              <Link 
                to={`/artisan/${user.id}`}
                className="bg-white text-orange-950 border-2 border-orange-950 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition"
              >
                Voir ma vitrine
              </Link>
              <button 
                onClick={() => setIsAddingProduct(true)}
                className="bg-orange-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-800 transition shadow-md"
              >
                + Nouveau Produit
              </button>
            </>
          )}
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Orders/Stats */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50">
            <h2 className="text-2xl font-heritage font-bold text-orange-950 mb-6">Suivi des Commandes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-orange-50 text-orange-950/40 text-sm uppercase tracking-wider">
                    <th className="pb-4 font-bold">Produit</th>
                    <th className="pb-4 font-bold">Date</th>
                    <th className="pb-4 font-bold">Total</th>
                    <th className="pb-4 font-bold">Statut</th>
                    <th className="pb-4 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-50">
                  {MOCK_ORDERS.filter(o => o.artisanId === user.id || o.clientId === user.id).map(order => (
                    <tr key={order.id} className="text-orange-950 font-medium">
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span>{order.productTitle}</span>
                          {order.isCustom && <span className="text-[10px] text-orange-600 font-bold uppercase tracking-tighter">Sur Mesure</span>}
                        </div>
                      </td>
                      <td className="py-4">{order.date}</td>
                      <td className="py-4">{order.total} MAD</td>
                      <td className="py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-4">
                        <button className="text-orange-700 text-sm font-bold hover:underline">Voir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {user.role === UserRole.ARTISAN && (
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50">
              <h2 className="text-2xl font-heritage font-bold text-orange-950 mb-6">Mon Catalogue</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {MOCK_PRODUCTS.filter(p => p.artisanId === user.id).map(prod => (
                  <div key={prod.id} className="flex gap-4 p-4 border border-orange-50 rounded-2xl">
                    <img src={prod.image} className="w-20 h-20 rounded-lg object-cover" alt="" />
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-orange-950">{prod.title}</h4>
                      <p className="text-sm text-orange-700 font-bold">{prod.price} MAD</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: AI & Profile */}
        <div className="space-y-8">
          {/* AI Artisan Companion */}
          <section className="bg-orange-900 text-white p-6 rounded-3xl shadow-lg zellige-pattern">
            <h3 className="text-xl font-heritage font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🧞‍♂️</span> Conseil Patrimoine AI
            </h3>
            <p className="text-orange-100/80 text-sm mb-6">
              Améliorez votre boutique avec l'aide de l'IA. Demandez des conseils de vente ou de production.
            </p>
            <div className="space-y-4">
              <textarea 
                className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm text-white placeholder-orange-200/50 focus:outline-none focus:ring-1 focus:ring-orange-400"
                rows={3}
                placeholder="Ex: Comment mieux photographier mes tapis ?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              ></textarea>
              <button 
                onClick={handleAskAi}
                className="w-full bg-orange-700 hover:bg-orange-600 py-3 rounded-xl text-sm font-bold transition"
              >
                Poser la question
              </button>
              {aiAdvice && (
                <div className="mt-4 p-4 bg-white/5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap animate-fade-in">
                  {aiAdvice}
                </div>
              )}
            </div>
          </section>

          {/* Mini Profile Card */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50 text-center">
            <img src={user.avatar} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-orange-50" alt="" />
            <h3 className="text-xl font-heritage font-bold text-orange-950">{user.name}</h3>
            <p className="text-sm text-orange-800 font-medium mb-4">{user.region || 'Utilisateur Plateforme'}</p>
            <div className="pt-4 border-t border-orange-50 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-orange-50 p-2 rounded-lg">
                <p className="font-bold text-orange-900">12</p>
                <p className="text-orange-700/60 uppercase">Commandes</p>
              </div>
              <div className="bg-orange-50 p-2 rounded-lg">
                <p className="font-bold text-orange-900">4.9/5</p>
                <p className="text-orange-700/60 uppercase">Note</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Add Product Modal (Simple simulation) */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-heritage font-bold text-orange-950">Exposer une création</h2>
              <button onClick={() => setIsAddingProduct(false)} className="text-orange-950 text-2xl">&times;</button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-orange-950 mb-2">Titre du produit</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500" 
                  placeholder="Ex: Tajine en terre cuite de Salé"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-orange-950 mb-2">Catégorie</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    {CRAFT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-orange-950 mb-2">Prix (MAD)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500" 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-orange-950">Description</label>
                  <button 
                    onClick={handleGenerateDescription}
                    disabled={aiLoading || !newProduct.title}
                    className="text-xs bg-orange-700 text-white px-3 py-1 rounded-full hover:bg-orange-800 disabled:bg-gray-300 transition"
                  >
                    {aiLoading ? 'Génération...' : '✨ Générer avec l\'IA'}
                  </button>
                </div>
                <textarea 
                  rows={4} 
                  className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-4 border-t border-orange-50">
                <button 
                  className="w-full bg-orange-800 text-white py-4 rounded-xl font-bold hover:bg-orange-900 transition shadow-lg"
                  onClick={() => setIsAddingProduct(false)}
                >
                  Publier l'œuvre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;