
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_USERS, MOCK_PRODUCTS } from '../constants';
import ProductCard from '../components/ProductCard';

const ArtisanShowroom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const artisan = MOCK_USERS.find(u => u.id === id);
  const products = MOCK_PRODUCTS.filter(p => p.artisanId === id);

  if (!artisan) {
    return <div className="p-20 text-center">Artisan non trouvé</div>;
  }

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Showroom Header */}
      <section className="bg-orange-50/50 py-20 border-b border-orange-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 zellige-pattern pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-[60px] overflow-hidden border-8 border-white shadow-2xl rotate-3">
              <img src={artisan.avatar} alt={artisan.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <span className="text-orange-700 font-bold tracking-[0.3em] uppercase mb-4 block">Maître Artisan</span>
              <h1 className="text-5xl md:text-7xl font-heritage font-bold text-orange-950 mb-6">{artisan.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
                <span className="bg-orange-200/50 text-orange-900 px-4 py-1 rounded-full text-sm font-bold">{artisan.region}</span>
                <span className="bg-orange-200/50 text-orange-900 px-4 py-1 rounded-full text-sm font-bold">{artisan.artisanProfile?.specialties?.[0] || 'Artisanat'}</span>
                <span className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-bold">Vérifié ✓</span>
              </div>
              <p className="text-xl text-orange-900/80 leading-relaxed max-w-2xl italic">
                "{artisan.artisanProfile?.bio || artisan.bio}"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Artisan's Collection */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-heritage font-bold text-orange-950">Catalogue de l'Atelier</h2>
            <p className="text-orange-900/40">{products.length} créations uniques disponibles</p>
          </div>
          <button className="hidden sm:block text-orange-800 font-bold border-b-2 border-orange-200 hover:border-orange-800 transition">
            Filtrer par disponibilité
          </button>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-orange-50">
            <p className="text-orange-900/40 text-lg">Aucun produit exposé pour le moment.</p>
          </div>
        )}
      </section>

      {/* Workshop Experience Callout */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="bg-orange-950 rounded-[50px] overflow-hidden flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 h-80 md:h-[500px]">
            <img
              src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80"
              className="w-full h-full object-cover opacity-80"
              alt="Artisan Workshop"
            />
          </div>
          <div className="md:w-1/2 p-12 md:p-20 text-white">
            <h3 className="text-4xl font-heritage font-bold mb-6 leading-tight">Envie de voir la main à l'œuvre ?</h3>
            <p className="text-orange-100/70 text-lg mb-10 font-light leading-relaxed">
              L'atelier de {artisan.name} est ouvert aux visiteurs curieux de découvrir les secrets ancestraux du {(artisan.artisanProfile?.specialties?.[0] || 'artisanat')?.toLowerCase()}. Planifiez une rencontre ou demandez un appel vidéo pour voir vos pièces en cours de fabrication.
            </p>
            <button className="bg-orange-700 hover:bg-orange-600 px-10 py-4 rounded-2xl font-bold transition shadow-2xl">
              Contacter l'Atelier
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArtisanShowroom;