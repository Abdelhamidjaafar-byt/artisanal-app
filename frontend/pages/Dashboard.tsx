
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, OrderStatus, Order, Notification } from '../types';
import { useNotification } from '../context/NotificationContext';
import { usePopup } from '../context/PopupContext';
import { CRAFT_CATEGORIES } from '../constants';
import { Edit, Trash2, X, Undo, RefreshCcw } from 'lucide-react';
import { generateProductDescription, getArtisanAdvisorResponse } from '../geminiService';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatImageUrl } from '../utils/imageUtils';
import { socketService } from '../services/socketService';
import ArtisanAnalytics from '../components/ArtisanAnalytics';


const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const statusLabels = {
    [OrderStatus.IN_CART]: 'Panier',
    [OrderStatus.PENDING]: 'En attente',
    [OrderStatus.IN_FABRICATION]: 'En fabrication',
    [OrderStatus.FINISHED]: 'Terminé',
    [OrderStatus.DELIVERED]: 'Livré',
    [OrderStatus.PAID]: 'Payé',
    [OrderStatus.SHIPPED]: 'Expédié',
    [OrderStatus.CANCELLED]: 'Annulé',
    [OrderStatus.REFUNDED]: 'Remboursé'
  };
  const styles = {
    [OrderStatus.IN_CART]: 'bg-gray-100 text-gray-800',
    [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [OrderStatus.IN_FABRICATION]: 'bg-blue-100 text-blue-800',
    [OrderStatus.FINISHED]: 'bg-green-100 text-green-800',
    [OrderStatus.DELIVERED]: 'bg-gray-100 text-gray-800',
    [OrderStatus.PAID]: 'bg-green-50 text-green-700',
    [OrderStatus.SHIPPED]: 'bg-purple-100 text-purple-800',
    [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
    [OrderStatus.REFUNDED]: 'bg-red-50 text-red-700',
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status]}`}>{statusLabels[status]}</span>;
};

const Dashboard: React.FC = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const { showNotification } = useNotification();
  const { showAlert, showConfirm } = usePopup();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
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
  const [statusReason, setStatusReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const [currentProductsPage, setCurrentProductsPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const getUserId = (u: any) => u?.id || u?._id || (typeof u === 'string' ? u : null);
  const currentUserId = getUserId(user);

  const checkIsAdmin = (u: any) => {
    if (!u || !u.role) return false;
    const roles = Array.isArray(u.role) ? u.role : [u.role];
    return roles.some(r => r === 'ADMIN' || r === UserRole.ADMIN);
  };

  const isAdmin = checkIsAdmin(user);

  const isActualArtisan =
    (typeof selectedOrder?.artisan === 'object' && selectedOrder.artisan !== null && (getUserId(selectedOrder.artisan) === currentUserId)) ||
    ((selectedOrder as any)?.artisanId === currentUserId) ||
    (typeof selectedOrder?.artisan === 'string' && (selectedOrder.artisan as string) === currentUserId);

  const isActualClient =
    (typeof selectedOrder?.client === 'object' && selectedOrder.client !== null && (getUserId(selectedOrder.client) === currentUserId)) ||
    ((selectedOrder as any)?.clientId === currentUserId) ||
    (typeof selectedOrder?.client === 'string' && (selectedOrder.client as string) === currentUserId);

  const canManageStatus = isAdmin || isActualArtisan;
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    region: user?.region || '',
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postalCode || ''
  });
  const [newProduct, setNewProduct] = useState({ title: '', category: CRAFT_CATEGORIES[0], price: 0, description: '', stock: 0, isCustomizable: false });
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

      // Connect to socket
      socketService.connect(user.id);

      // Listen for order updates
      socketService.on('order_status_updated', (data: any) => {
        console.log('Order update received:', data);

        // Update orders list immediately
        setOrders(prevOrders => prevOrders.map(o =>
          o._id === data.orderId ? { ...o, status: data.status } : o
        ));

        // Update selected order if open
        if (selectedOrder && selectedOrder._id === data.orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: data.status } : null);
        }

        // Refresh notifications as a new one was likely created
        fetchNotifications();

        // Show a toast or alert (optional, using browser alert for now as per existing pattern)
        // alert(`Commande mise à jour: ${data.status}`); // blocked to avoid spamming alerts
      });

      return () => {
        socketService.disconnect();
        socketService.off('order_status_updated');
      };
    }
  }, [user, selectedOrder]); // Added selectedOrder to dependency to update it correctly inside listener


  if (!user) return <div className="p-10 text-center">Chargement...</div>;

  const handleGenerateDescription = async () => {
    if (!newProduct.title) return;
    setAiLoading(true);
    const desc = await generateProductDescription(newProduct.title, newProduct.category);
    setNewProduct({ ...newProduct, description: desc });
    setAiLoading(false);
  }


  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus, reason?: string) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus, reason });

      // Update local state
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      showNotification('Statut mis à jour avec succès', 'success');
      setShowReasonInput(false);
      setStatusReason('');
      setPendingStatus(null);
    } catch (error: any) {
      console.error('Failed to update status:', error);
      showNotification(`Erreur lors de la mise à jour du statut: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
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
      showNotification('Impossible de charger les détails de la commande', 'error');
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

  const handleEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setNewProduct({
      title: prod.title,
      category: prod.category,
      price: prod.price,
      description: prod.description,
      stock: prod.stock || 0,
      isCustomizable: prod.isCustomizable || false
    });
    // For images, we just show previews if they exist
    if (prod.images) {
      setImagePreviews(prod.images.map((img: string) => formatImageUrl(img)));
    } else if (prod.image) {
      setImagePreviews([formatImageUrl(prod.image)]);
    }
    setIsAddingProduct(true);
  };

  const handleDeleteProduct = async (prodId: string) => {
    const confirmed = await showConfirm(
      "Suppression de produit",
      "Êtes-vous sûr de vouloir supprimer ce produit ?"
    );
    if (!confirmed) return;

    try {
      await api.delete(`/products/${prodId}`);
      setProducts(prev => prev.filter(p => p._id !== prodId && p.id !== prodId));
      showNotification("Produit supprimé.", 'success');
    } catch (error) {
      console.error('Failed to delete product:', error);
      showNotification("Erreur lors de la suppression.", 'error');
    }
  };

  const handleSubmitProduct = async () => {
    if (!newProduct.title || !newProduct.price || (!editingProduct && productImages.length === 0)) {
      showAlert("Champs manquants", "Veuillez remplir les champs obligatoires et ajouter au moins une image.");
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
      formData.append('isCustomizable', newProduct.isCustomizable.toString());

      productImages.forEach(image => {
        formData.append('images', image);
      });

      if (editingProduct) {
        await api.patch(`/products/${editingProduct._id || editingProduct.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showNotification("Produit mis à jour !", 'success');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showNotification("Produit publié !", 'success');
      }

      setIsAddingProduct(false);
      setEditingProduct(null);
      setNewProduct({ title: '', category: CRAFT_CATEGORIES[0], price: 0, description: '', stock: 0, isCustomizable: false });
      setProductImages([]);
      setImagePreviews([]);

      // Refresh products
      const res = await api.get(`/products?artisan=${user.id}`);
      const productsData = res.data.products || res.data;
      const mappedProducts = productsData.map((p: any) => ({
        ...p,
        id: p._id,
        image: formatImageUrl(p.images?.[0] || p.image)
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Failed to submit product:', error);
      showAlert("Erreur de publication", "Une erreur est survenue lors de la publication de votre produit. Veuillez réessayer.");
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const res = await api.patch('/users/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Refresh user data from server to get the updated avatar URL
        if (refreshUser) {
          await refreshUser();
        }

        showNotification('Photo de profil mise à jour', 'success');
      } catch (error) {
        console.error('Failed to upload avatar:', error);
        showNotification('Erreur lors de l\'upload de la photo de profil', 'error');
      }
    }
  };

  useEffect(() => {
    const fetchMyProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await api.get(`/products?artisan=${user.id}`);
        const productsData = res.data.products || res.data;
        const mappedProducts = productsData.map((p: any) => ({
          ...p,
          id: p._id,
          image: formatImageUrl(p.images?.[0] || p.image)
        }));
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Failed to fetch my products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (user && user.role.includes(UserRole.ARTISAN)) {
      fetchMyProducts();
    }
  }, [user.id]);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-heritage font-bold text-orange-950 mb-2">Bienvenue, {user.name}</h1>
            <p className="text-orange-800/60 font-medium">Tableau de bord {user.role[0]?.toLowerCase()}</p>
          </div>
          <div className="flex gap-4">
            {user.role.includes(UserRole.ADMIN) && (
              <Link
                to="/admin"
                className="bg-orange-950 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-900 transition shadow-md"
              >
                Console Admin
              </Link>
            )}
            {user.role.includes(UserRole.ARTISAN) && (
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
            {user.role.includes(UserRole.ARTISAN) && <ArtisanAnalytics />}

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
                        {!user.role.includes(UserRole.ARTISAN) && <th className="pb-4 font-bold">Artisan</th>}
                        {user.role.includes(UserRole.ARTISAN) && <th className="pb-4 font-bold">Client</th>}
                        <th className="pb-4 font-bold">Date</th>
                        <th className="pb-4 font-bold">Total</th>
                        <th className="pb-4 font-bold">Statut</th>
                        <th className="pb-4 font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-50">
                      {(() => {
                        const paginatedOrders = orders.slice((currentOrdersPage - 1) * ITEMS_PER_PAGE, currentOrdersPage * ITEMS_PER_PAGE);
                        return paginatedOrders.map(order => (
                          <tr key={order._id} className="text-orange-950 font-medium hover:bg-orange-50/30 transition">
                            <td className="py-4">
                              <div className="flex flex-col">
                                <span className="font-bold">Commande #{order._id?.slice(-6).toUpperCase()}</span>
                                <span className="text-xs text-orange-600 font-medium">{order.items?.length} article(s)</span>
                              </div>
                            </td>
                            {!user.role.includes(UserRole.ARTISAN) && (
                              <td className="py-4">
                                {order.artisan?.name || 'Artisan'}
                              </td>
                            )}
                            {user.role.includes(UserRole.ARTISAN) && (
                              <td className="py-4">
                                {order.client?.name || 'Client'}
                              </td>
                            )}
                            <td className="py-4 text-orange-800/70">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                            <td className="py-4 font-bold">{order.totalAmount} MAD</td>
                            <td className="py-4">
                              <StatusBadge status={order.status} />
                            </td>
                            <td className="py-4">
                              <button
                                onClick={() => handleViewOrder(order._id)}
                                className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-bold hover:bg-orange-100 transition shadow-sm"
                              >
                                Voir
                              </button>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls for Orders */}
              {(() => {
                const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
                if (totalPages <= 1) return null;
                return (
                  <div className="mt-8 flex items-center justify-center gap-2 pt-4 border-t border-orange-50">
                    <button onClick={() => setCurrentOrdersPage(prev => Math.max(1, prev - 1))} disabled={currentOrdersPage === 1} className="px-4 py-2 rounded-lg text-sm font-bold text-orange-950/60 hover:bg-orange-50 disabled:opacity-30 transition">Précédent</button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i + 1} onClick={() => setCurrentOrdersPage(i + 1)} className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${currentOrdersPage === i + 1 ? 'bg-orange-950 text-white shadow-md' : 'text-orange-950/60 hover:bg-orange-50'}`}>{i + 1}</button>
                    ))}
                    <button onClick={() => setCurrentOrdersPage(prev => Math.min(totalPages, prev + 1))} disabled={currentOrdersPage === totalPages} className="px-4 py-2 rounded-lg text-sm font-bold text-orange-950/60 hover:bg-orange-50 disabled:opacity-30 transition">Suivant</button>
                  </div>
                );
              })()}
            </section>

            {user.role.includes(UserRole.ARTISAN) && (
              <>
                <section className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50">
                  <h2 className="text-2xl font-heritage font-bold text-orange-950 mb-6">Mon Catalogue</h2>
                  {loadingProducts ? (
                    <div className="text-center py-4 text-orange-800/60 text-sm">Chargement du catalogue...</div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-4 text-orange-800/60 text-sm">Vous n'avez pas encore exposé de produits.</div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {(() => {
                        const paginatedProducts = products.slice((currentProductsPage - 1) * ITEMS_PER_PAGE, currentProductsPage * ITEMS_PER_PAGE);
                        return paginatedProducts.map(prod => (
                          <div key={prod._id} className="flex gap-4 p-4 border border-orange-50 rounded-2xl group relative bg-orange-50/10 hover:bg-white hover:shadow-md transition-all">
                            <img src={formatImageUrl(prod.images?.[0] || prod.image)} className="w-20 h-20 rounded-xl object-cover shadow-sm" alt="" />
                            <div className="flex flex-col justify-center flex-1">
                              <h4 className="font-bold text-orange-950">{prod.title}</h4>
                              <p className="text-sm text-orange-700 font-bold">{prod.price} MAD</p>
                              <p className="text-[10px] text-orange-900/40 uppercase tracking-widest font-bold mt-1">{prod.category}</p>
                            </div>
                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition translate-x-2 group-hover:translate-x-0">
                              <button
                                onClick={() => handleEditProduct(prod)}
                                className="p-2 bg-white text-orange-700 rounded-xl border border-orange-100 hover:bg-orange-50 transition shadow-sm"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod._id || prod.id)}
                                className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-100 transition shadow-sm"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  )}

                  {/* Pagination Controls for Products */}
                  {(() => {
                    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
                    if (totalPages <= 1) return null;
                    return (
                      <div className="mt-8 flex items-center justify-center gap-2 pt-4 border-t border-orange-50">
                        <button onClick={() => setCurrentProductsPage(prev => Math.max(1, prev - 1))} disabled={currentProductsPage === 1} className="px-4 py-2 rounded-lg text-sm font-bold text-orange-950/60 hover:bg-orange-50 disabled:opacity-30 transition">Précédent</button>
                        {[...Array(totalPages)].map((_, i) => (
                          <button key={i + 1} onClick={() => setCurrentProductsPage(i + 1)} className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${currentProductsPage === i + 1 ? 'bg-orange-950 text-white shadow-md' : 'text-orange-950/60 hover:bg-orange-50'}`}>{i + 1}</button>
                        ))}
                        <button onClick={() => setCurrentProductsPage(prev => Math.min(totalPages, prev + 1))} disabled={currentProductsPage === totalPages} className="px-4 py-2 rounded-lg text-sm font-bold text-orange-950/60 hover:bg-orange-50 disabled:opacity-30 transition">Suivant</button>
                      </div>
                    );
                  })()}
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
              <div className="relative w-24 h-24 mx-auto mb-4 group">
                <img
                  src={user.avatar ? `${user.avatar}?t=${Date.now()}` : 'https://via.placeholder.com/150'}
                  className="w-24 h-24 rounded-full border-4 border-orange-50 object-cover"
                  alt=""
                  key={user.avatar}
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  <span className="text-white text-[10px] font-bold">Changer</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-orange-950 mb-2">Nom complet</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-orange-50/10"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-orange-950 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-orange-50/10"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-orange-950 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-orange-50/10"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-orange-950 mb-2">Région</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-orange-50/10"
                      value={editForm.region}
                      onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-orange-950 mb-2">Ville</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-orange-50/10"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-orange-950 mb-2">Adresse</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-orange-50/10"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-orange-950 mb-2">Code postal</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-orange-50/10"
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
                <h2 className="text-3xl font-heritage font-bold text-orange-950">
                  {editingProduct ? 'Modifier la création' : 'Exposer une création'}
                </h2>
                <button onClick={() => {
                  setIsAddingProduct(false);
                  setEditingProduct(null);
                  setNewProduct({ title: '', category: CRAFT_CATEGORIES[0], price: 0, description: '', stock: 0, isCustomizable: false });
                  setProductImages([]);
                  setImagePreviews([]);
                }} className="text-orange-950 text-2xl">&times;</button>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-orange-950 ml-1">Titre du produit</label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 rounded-2xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-orange-50/10"
                    placeholder="Ex: Tajine en terre cuite de Salé"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-orange-950 ml-1">Catégorie</label>
                    <select
                      className="w-full px-5 py-4 rounded-2xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-orange-50/10"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    >
                      {CRAFT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-orange-950 ml-1">Prix (MAD)</label>
                    <input
                      type="number"
                      className="w-full px-5 py-4 rounded-2xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-orange-50/10"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-orange-950 ml-1">Description</label>
                    <button
                      onClick={handleGenerateDescription}
                      disabled={aiLoading || !newProduct.title}
                      className="text-xs bg-orange-700 text-white px-4 py-2 rounded-full hover:bg-orange-800 disabled:bg-gray-300 transition-all shadow-md active:scale-95"
                    >
                      {aiLoading ? (
                        <span className="flex items-center gap-1"><span className="animate-spin inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full"></span> Génération...</span>
                      ) : (
                        '✨ Générer avec l\'IA'
                      )}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    className="w-full px-5 py-4 rounded-2xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-orange-50/10 resize-none"
                    placeholder="Décrivez votre création, son histoire et sa fabrication..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  ></textarea>
                </div>

                {/* Customizable Checkbox */}
                <div className="flex items-center gap-3 p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                  <input
                    type="checkbox"
                    id="isCustomizable"
                    checked={newProduct.isCustomizable}
                    onChange={(e) => setNewProduct({ ...newProduct, isCustomizable: e.target.checked })}
                    className="w-5 h-5 text-orange-700 bg-white border-orange-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                  />
                  <label htmlFor="isCustomizable" className="text-sm font-bold text-orange-950 cursor-pointer flex-1">
                    Ce produit est personnalisable
                    <span className="block text-xs font-normal text-orange-700/60 mt-1">
                      Les clients pourront demander des modifications sur mesure
                    </span>
                  </label>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-orange-950 ml-1">Images du produit (Max 5)</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group border border-orange-100">
                        <img src={preview} className="w-full h-full object-cover" alt="" />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {imagePreviews.length < 5 && (
                      <label className="aspect-square border-2 border-dashed border-orange-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 transition-all group">
                        <div className="text-2xl text-orange-300 group-hover:scale-110 transition-transform">📸</div>
                        <span className="text-[10px] font-bold text-orange-400 mt-1 uppercase">Ajouter</span>
                        <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-orange-50">
                  <button
                    className="w-full bg-orange-800 text-white py-4 rounded-xl font-bold hover:bg-orange-900 transition shadow-lg disabled:bg-orange-300"
                    onClick={handleSubmitProduct}
                    disabled={aiLoading}
                  >
                    {aiLoading ? (editingProduct ? 'Mise à jour...' : 'Publication...') : (editingProduct ? 'Enregistrer les modifications' : "Publier l'œuvre")}
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

                  {/* Status Management (Admin/Artisan) */}
                  {canManageStatus && (
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6">
                      <h4 className="text-sm font-bold text-orange-950 mb-3 text-center uppercase tracking-widest opacity-70">Gestion du Statut</h4>
                      {isAdmin ? (
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => handleUpdateStatus(selectedOrder._id!, e.target.value as OrderStatus)}
                          className="w-full bg-white text-orange-900 font-bold py-3 px-4 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-200 shadow-sm"
                        >
                          {Object.values(OrderStatus).map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {Object.values(OrderStatus).map((status) => (
                            <button
                              key={status}
                              onClick={() => {
                                if (status === OrderStatus.CANCELLED || status === OrderStatus.REFUNDED) {
                                  setPendingStatus(status);
                                  setShowReasonInput(true);
                                } else {
                                  handleUpdateStatus(selectedOrder!._id!, status);
                                }
                              }}
                              disabled={selectedOrder.status === status}
                              className={`px-3 py-2 rounded-lg text-xs font-bold transition flex-1 min-w-[120px] ${selectedOrder.status === status
                                ? 'bg-orange-950 text-white cursor-default shadow-md'
                                : 'bg-white text-orange-800 border border-orange-200 hover:bg-orange-100 hover:shadow-sm'
                                }`}
                            >
                              {status === OrderStatus.IN_CART && 'Panier'}
                              {status === OrderStatus.PENDING && 'En attente'}
                              {status === OrderStatus.IN_FABRICATION && 'En fabrication'}
                              {status === OrderStatus.FINISHED && 'Terminé'}
                              {status === OrderStatus.DELIVERED && 'Livré'}
                              {status === OrderStatus.PAID && 'Payé'}
                              {status === OrderStatus.SHIPPED && 'Expédié'}
                              {status === OrderStatus.CANCELLED && 'Annulé'}
                              {status === OrderStatus.REFUNDED && 'Remboursé'}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Client Actions */}
                  {isActualClient && (
                    <div className="space-y-4 mb-6">
                      {showReasonInput ? (
                        <div className="bg-white p-4 rounded-xl border border-orange-200 animate-fade-in shadow-inner">
                          <h4 className="font-bold text-orange-950 mb-2">
                            {pendingStatus === OrderStatus.CANCELLED ? "Motif de l'annulation" : "Motif du remboursement"}
                          </h4>
                          <textarea
                            className="w-full bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 mb-3"
                            rows={3}
                            placeholder="Veuillez préciser la raison..."
                            value={statusReason}
                            onChange={(e) => setStatusReason(e.target.value)}
                          ></textarea>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setShowReasonInput(false);
                                setStatusReason('');
                                setPendingStatus(null);
                              }}
                              className="flex-1 py-3 text-sm font-bold text-orange-800 hover:bg-orange-50 rounded-xl border border-orange-100 transition"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => {
                                // If cancelling a paid order, it should demand a refund
                                if (pendingStatus === OrderStatus.CANCELLED && (selectedOrder.status === OrderStatus.PAID || selectedOrder.status === OrderStatus.SHIPPED || selectedOrder.status === OrderStatus.DELIVERED)) {
                                  handleUpdateStatus(selectedOrder._id!, OrderStatus.REFUNDED, statusReason);
                                } else {
                                  handleUpdateStatus(selectedOrder._id!, pendingStatus!, statusReason);
                                }
                              }}
                              disabled={!statusReason.trim()}
                              className="flex-1 py-3 text-sm font-bold bg-orange-700 text-white rounded-xl hover:bg-orange-800 disabled:opacity-50 shadow-md transition"
                            >
                              Confirmer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {['IN_CART', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED'].includes(selectedOrder.status) && (
                            <button
                              onClick={() => {
                                setPendingStatus(OrderStatus.CANCELLED);
                                setShowReasonInput(true);
                              }}
                              className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition border border-red-100 flex items-center justify-center gap-2 group shadow-sm"
                            >
                              <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              {['PAID', 'SHIPPED', 'DELIVERED'].includes(selectedOrder.status) ? "Annuler et demander remboursement" : "Annuler la commande"}
                            </button>
                          )}
                          {['PAID', 'SHIPPED', 'DELIVERED'].includes(selectedOrder.status) && (
                            <button
                              onClick={() => {
                                setPendingStatus(OrderStatus.REFUNDED);
                                setShowReasonInput(true);
                              }}
                              className="w-full bg-orange-50 text-orange-800 py-3 rounded-xl font-bold hover:bg-orange-100 transition border border-orange-100 flex items-center justify-center gap-2 group shadow-sm"
                            >
                              <Undo className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              Demander un remboursement
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reasons Display */}
                  {(selectedOrder.status === OrderStatus.CANCELLED && selectedOrder.cancellationReason) && (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6">
                      <h3 className="font-bold text-red-800 mb-1">Motif d'annulation</h3>
                      <p className="text-red-700 text-sm italic">"{selectedOrder.cancellationReason}"</p>
                    </div>
                  )}
                  {(selectedOrder.status === OrderStatus.REFUNDED && selectedOrder.refundReason) && (
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6">
                      <h3 className="font-bold text-orange-800 mb-1">Motif du remboursement</h3>
                      <p className="text-orange-700 text-sm italic">"{selectedOrder.refundReason}"</p>
                    </div>
                  )}

                  {/* Client/Artisan Info */}
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <h3 className="font-bold text-orange-950 mb-2">
                      {user.role.includes(UserRole.ARTISAN) ? 'Client' : 'Artisan'}
                    </h3>
                    <p className="text-orange-800">
                      {user.role.includes(UserRole.ARTISAN)
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