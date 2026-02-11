
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, OrderStatus, Order, Notification } from '../types';
import { MOCK_PRODUCTS, CRAFT_CATEGORIES } from '../constants';
import { generateProductDescription, getArtisanAdvisorResponse } from '../geminiService';
import { Link } from 'react-router-dom';
import api from '../services/api';


const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const statusLabels = {
    [OrderStatus.PENDING]: 'En attente',
    [OrderStatus.MANUFACTURING]: 'En fabrication',
    [OrderStatus.COMPLETED]: 'Terminé',
    [OrderStatus.DELIVERED]: 'Livré'
  };
  const styles = {
    [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [OrderStatus.MANUFACTURING]: 'bg-blue-100 text-blue-800',
    [OrderStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [OrderStatus.DELIVERED]: 'bg-gray-100 text-gray-800',
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status]}`}>{statusLabels[status]}</span>;
};

const Dashboard: React.FC = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // Refresh user data on mount to catch approval status
  useEffect(() => {
    if (refreshUser) {
      refreshUser();
    }
  }, []);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    region: user?.region || '',
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postalCode || ''
  });
  const [newProduct, setNewProduct] = useState({ title: '', category: CRAFT_CATEGORIES[0], price: 0, description: '', stock: 0 });
  const [productImages, setProductImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');
  const [query, setQuery] = useState('');

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        setOrders(res.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    if (user) {
      fetchOrders();
      fetchNotifications();
    }
  }, [user, user.id]);

  if (!user) return <div className="p-10 text-center">Chargement...</div>;

  const handleGenerateDescription = async () => {
    if (!newProduct.title) return;
    setAiLoading(true);
    const desc = await generateProductDescription(newProduct.title, newProduct.category);
    setNewProduct({ ...newProduct, description: desc });
    setAiLoading(false);
  }


  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });

      // Update local state
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      alert('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleViewOrder = async (orderId: string) => {
    setLoadingOrderDetail(true);
    try {
      const res = await api.get(`/orders/${orderId}`);
      setSelectedOrder(res.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      alert('Impossible de charger les détails de la commande');
    } finally {
      setLoadingOrderDetail(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files: File[] = Array.from(e.target.files);
      setProductImages(prev => [...prev, ...files]);

      const newPreviews = files.map((file: File) => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmitProduct = async () => {
    if (!newProduct.title || !newProduct.price || productImages.length === 0) {
      alert('Veuillez remplir les champs obligatoires et ajouter au moins une image.');
      return;
    }

    setAiLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newProduct.title);
      formData.append('category', newProduct.category);
      formData.append('price', newProduct.price.toString());
      formData.append('description', newProduct.description);
      formData.append('stock', newProduct.stock.toString());

      productImages.forEach(image => {
        formData.append('images', image);
      });

      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setIsAddingProduct(false);
      setNewProduct({ title: '', category: CRAFT_CATEGORIES[0], price: 0, description: '', stock: 0 });
      setProductImages([]);
      setImagePreviews([]);

      // Refresh products
      const res = await api.get('/products');
      if (user.role.includes('ARTISAN')) {
        setProducts(res.data.filter((p: any) => p.artisan?._id === user.id || p.artisan === user.id));
      }
    } catch (error) {
      console.error('Failed to add product:', error);
      alert('Erreur lors de la publication du produit.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (updateUser) {
      await updateUser(editForm);
      setIsEditingProfile(false);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-heritage font-bold text-orange-950 mb-2">Bienvenue, {user.name}</h1>
            <p className="text-orange-800/60 font-medium">Tableau de bord {user.role.toLowerCase()}</p>
          </div>
          <div className="flex gap-4">
            {user.role === UserRole.ADMIN && (
              <Link
                to="/admin"
                className="bg-orange-950 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-900 transition shadow-md"
              >
                Console Admin
              </Link>
            )}
            {user.role === UserRole.ARTISAN && (
              <>
                {!user.isApproved && (
                  <div className="bg-orange-100 border border-orange-200 text-orange-800 px-6 py-3 rounded-xl font-medium animate-pulse">
                    ⚠️ Compte en attente d'approbation par l'administrateur.
                  </div>
                )}
                <Link
                  to={`/artisan/${user.id}`}
                  className="bg-white text-orange-950 border-2 border-orange-950 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition"
                >
                  Voir ma vitrine
                </Link>
                <button
                  onClick={() => setIsAddingProduct(true)}
                  disabled={!user.isApproved}
                  className="bg-orange-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-800 transition shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
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
              {loadingOrders ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-700 mx-auto"></div>
                  <p className="text-orange-800/60 mt-2">Chargement des commandes...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-orange-800/60">
                  <p>Aucune commande pour le moment</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-orange-50 text-orange-950/40 text-sm uppercase tracking-wider">
                        <th className="pb-4 font-bold">Commande</th>
                        {user.role !== 'ARTISAN' && <th className="pb-4 font-bold">Artisan</th>}
                        {user.role === 'ARTISAN' && <th className="pb-4 font-bold">Client</th>}
                        <th className="pb-4 font-bold">Date</th>
                        <th className="pb-4 font-bold">Total</th>
                        <th className="pb-4 font-bold">Statut</th>
                        <th className="pb-4 font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-50">
                      {orders.map(order => (
                        <tr key={order._id} className="text-orange-950 font-medium">
                          <td className="py-4">
                            <div className="flex flex-col">
                              <span>Commande #{order._id?.slice(-6)}</span>
                              <span className="text-xs text-orange-600">{order.items?.length} article(s)</span>
                            </div>
                          </td>
                          {user.role !== 'ARTISAN' && (
                            <td className="py-4">
                              {order.artisan?.name || 'Artisan'}
                            </td>
                          )}
                          {user.role === 'ARTISAN' && (
                            <td className="py-4">
                              {order.client?.name || 'Client'}
                            </td>
                          )}
                          <td className="py-4">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                          <td className="py-4">{order.totalAmount} MAD</td>
                          <td className="py-4">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => handleViewOrder(order._id)}
                              className="text-orange-700 text-sm font-bold hover:underline"
                            >
                              Voir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {user.role === UserRole.ARTISAN && (
              <>
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

                {/* Notifications Section */}
                <section className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50 mt-8">
                  <h3 className="text-xl font-heritage font-bold text-orange-950 mb-4">Notifications</h3>
                  {loadingNotifications ? (
                    <div className="text-center py-4 text-orange-800/60">Chargement...</div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-4 text-orange-800/60 text-sm">Aucune notification</div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {notifications.map(notification => (
                        <div
                          key={notification._id}
                          className={`p-3 rounded-xl border ${notification.isRead ? 'bg-gray-50 border-gray-100' : 'bg-orange-50 border-orange-100'} transition`}
                          onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                        >
                          <div className="flex justify-between items-start">
                            <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-orange-900 font-bold'}`}>
                              {notification.message}
                            </p>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-orange-500 rounded-full mt-1"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>


          {/* Right Column: Companion & Profile */}
          <div className="space-y-8">
            {/* Artisan Companion */}
            {/* <section className="bg-orange-900 text-white p-6 rounded-3xl shadow-lg zellige-pattern">
            <h3 className="text-xl font-heritage font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🧞‍♂️</span> Assistant Artisan
            </h3>
            <p className="text-orange-100/80 text-sm mb-6">
              Améliorez votre boutique. Demandez des conseils de vente ou de production.
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
          </section> */}

            {/* Mini Profile Card */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50 text-center">
              <img src={user.avatar} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-orange-50" alt="" />
              <h3 className="text-xl font-heritage font-bold text-orange-950">{user.name}</h3>
              <p className="text-sm text-orange-800 font-medium mb-4">{user.region || 'Utilisateur Plateforme'}</p>
              <div className="pt-4 border-t border-orange-50 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-orange-50 p-2 rounded-lg">
                  <p className="font-bold text-orange-900">{orders.length}</p>
                  <p className="text-orange-700/60 uppercase">Commandes</p>
                </div>
                <div className="bg-orange-50 p-2 rounded-lg">
                  <p className="font-bold text-orange-900">-</p>
                  <p className="text-orange-700/60 uppercase">Note</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="mt-4 w-full bg-orange-100 text-orange-800 py-2 rounded-xl text-sm font-bold hover:bg-orange-200 transition"
              >
                Modifier le profil
              </button>
            </section>
          </div>
        </div>
      </div >

      {/* Edit Profile Modal */}
      {
        isEditingProfile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-heritage font-bold text-orange-950">Modifier le profil</h2>
                <button onClick={() => setIsEditingProfile(false)} className="text-orange-950 text-2xl">&times;</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-orange-950 mb-2">Nom complet</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-orange-950 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-orange-950 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-orange-950 mb-2">Région</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={editForm.region}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-orange-950 mb-2">Adresse</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-orange-950 mb-2">Ville</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-orange-950 mb-2">Code postal</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={editForm.postalCode}
                      onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-orange-50">
                  <button
                    className="w-full bg-orange-800 text-white py-4 rounded-xl font-bold hover:bg-orange-900 transition shadow-lg"
                    onClick={handleSaveProfile}
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Add Product Modal (Simple simulation) */}
      {
        isAddingProduct && (
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
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-orange-950 mb-2">Catégorie</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
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
                      onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
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
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
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
        )
      }


      {/* Order Detail Modal */}
      {
        selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-heritage font-bold text-orange-950">Commande #{selectedOrder._id?.slice(-6)}</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-orange-950 text-2xl">&times;</button>
              </div>

              {loadingOrderDetail ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-700 mx-auto"></div>
                  <p className="text-orange-800/60 mt-2">Chargement...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Order Status */}
                  <div className="flex items-center justify-between">
                    <StatusBadge status={selectedOrder.status} />
                    <span className="text-sm text-orange-800/60">
                      {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Status Update Controls for Artisan */}
                  {user.role === UserRole.ARTISAN && (
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                      <h4 className="text-sm font-bold text-orange-950 mb-3">Mettre à jour le statut</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.values(OrderStatus).map((status) => (
                          <button
                            key={status}
                            onClick={() => handleUpdateStatus(selectedOrder!._id!, status)}
                            disabled={selectedOrder.status === status}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${selectedOrder.status === status
                              ? 'bg-orange-950 text-white cursor-default'
                              : 'bg-white text-orange-800 border border-orange-200 hover:bg-orange-100'
                              }`}
                          >
                            {status === OrderStatus.PENDING && 'En attente'}
                            {status === OrderStatus.MANUFACTURING && 'En fabrication'}
                            {status === OrderStatus.COMPLETED && 'Terminé'}
                            {status === OrderStatus.DELIVERED && 'Livré'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Client/Artisan Info */}
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <h3 className="font-bold text-orange-950 mb-2">
                      {user.role === 'ARTISAN' ? 'Client' : 'Artisan'}
                    </h3>
                    <p className="text-orange-800">
                      {user.role === 'ARTISAN'
                        ? selectedOrder.client?.name
                        : selectedOrder.artisan?.name}
                    </p>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <h3 className="font-bold text-orange-950 mb-2">Adresse de livraison</h3>
                    <p className="text-orange-800 whitespace-pre-line">{selectedOrder.shippingAddress}</p>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-bold text-orange-950 mb-4">Articles commandés</h3>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center text-orange-600">
                              📦
                            </div>
                            <div>
                              <p className="font-bold text-orange-950">{item.product?.title || 'Article'}</p>
                              <p className="text-sm text-orange-700">Qty: {item.quantity}</p>
                              {item.customizationDetails && (
                                <p className="text-xs text-orange-600 italic">Sur mesure: {item.customizationDetails}</p>
                              )}
                            </div>
                          </div>
                          <p className="font-bold text-orange-800">{(item.price * item.quantity).toFixed(2)} MAD</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t border-orange-100 pt-4">
                    <div className="flex justify-between items-center text-xl font-bold text-orange-950">
                      <span>Total</span>
                      <span>{selectedOrder.totalAmount} MAD</span>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        )
      }
    </>
  )
}

export default Dashboard;