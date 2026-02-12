
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CRAFT_CATEGORIES } from '../constants';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import { Product } from '../types';
import { formatImageUrl } from '../utils/imageUtils';

// Import craft images
import tissageImg from '../assets/Tissage.jpeg';
import poterieImg from '../assets/Poterie.jpeg';
import dinanderieImg from '../assets/dinanderie.jpeg';
import menuiserieImg from '../assets/menuiserie.jpeg';
import broderieImg from '../assets/broderie.jpeg';
import coutureImg from '../assets/Couture.jpeg';
import maroquinerieImg from '../assets/Maroquinerie.jpeg';
import zelligeImg from '../assets/Zellige.jpeg';
import ferronnerieImg from '../assets/ferronnerie.jpeg';
import tannageImg from '../assets/Tannage.jpeg';

const CATEGORY_IMAGES: Record<string, string> = {
  'Tissage (زرابي)': tissageImg,
  'Poterie et Céramique': poterieImg,
  'Dinanderie (نحاس)': dinanderieImg,
  'Menuiserie Traditionnelle': menuiserieImg,
  'Broderie Artisanale': broderieImg,
  'Couture (Kaftan & Djellaba)': coutureImg,
  'Maroquinerie': maroquinerieImg,
  'Zellige': zelligeImg,
  'Ferronnerie': ferronnerieImg,
  'Tannage': tannageImg,
};

const Home: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get('/products');
        // Map backend products and take the first 4
        const mappedProducts: Product[] = response.data.map((p: any) => {
          const mainImage = formatImageUrl(p.images?.[0] || p.image);
          return {
            id: p._id,
            artisanId: p.artisan?._id || 'unknown',
            artisanName: p.artisan?.name || 'Artisan Inconnu',
            title: p.title,
            description: p.description,
            price: p.price,
            category: p.category,
            image: mainImage,
            isCustomizable: p.isCustomizable,
            stock: p.stock
          };
        }).slice(0, 4);

        setFeaturedProducts(mappedProducts);
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1600&q=80"
            alt="Maroc Artisanat"
            className="w-full h-full object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fdfbf7] via-transparent to-orange-100/20"></div>
        </div>

        <div className="relative z-10 max-w-4xl px-4">
          <span className="text-orange-700 font-bold tracking-[0.3em] uppercase mb-4 block animate-fade-in">L'Héritage Vivant</span>
          <h1 className="text-6xl md:text-8xl font-heritage font-black text-orange-950 mb-8 leading-tight">
            L'excellence du <br /> <span className="text-orange-700 italic">Fait-Main</span>
          </h1>
          <p className="text-xl md:text-2xl text-orange-900/80 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Plongez dans l'univers des maîtres artisans marocains. Une collection exclusive de trésors authentiques, directement de leurs mains aux vôtres.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/catalogue" className="bg-orange-800 text-white px-12 py-5 rounded-full font-bold hover:bg-orange-950 transition shadow-xl text-lg hover:-translate-y-1 transform duration-300">
              Explorer le Catalogue
            </Link>
            <Link to="/login" className="bg-white/80 backdrop-blur-sm text-orange-900 border-2 border-orange-900/20 px-12 py-5 rounded-full font-bold hover:bg-white transition text-lg shadow-sm">
              Espace Artisan
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Carousel Section */}
      <section className="w-full bg-orange-50/50 py-16 group">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-4xl font-heritage font-bold text-orange-950">Nos Métiers d'Excellence</h2>
              <div className="h-1 w-24 bg-orange-700 mt-2 rounded-full"></div>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="overflow-hidden pb-8 pt-2"
          >
            <div className="flex gap-6 animate-slide w-max">
              {/* Direct categories and duplicated categories for seamless loop */}
              {[...CRAFT_CATEGORIES, ...CRAFT_CATEGORIES].map((cat, idx) => (
                <Link
                  key={idx}
                  to={`/catalogue?category=${encodeURIComponent(cat)}`}
                  className="flex-shrink-0 w-64 h-80 rounded-[40px] hover:border-orange-800 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-xl group/card text-center relative overflow-hidden flex flex-col items-center justify-center p-8"
                  style={{
                    backgroundImage: `url(${CATEGORY_IMAGES[cat]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-orange-950/40 group-hover/card:bg-orange-950/60 transition-colors duration-500"></div>
                  <div className="relative z-10">
                    {/* <div className="text-4xl mb-4 transform group-hover/card:scale-125 transition-transform duration-500">✨</div> */}
                    <p className="text-white font-heritage font-bold text-xl leading-snug drop-shadow-md">{cat}</p>
                    <p className="text-orange-200 text-xs mt-4 font-bold uppercase tracking-widest opacity-0 group-hover/card:opacity-100 transition-opacity">Découvrir</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products with Moorish Arch Design */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heritage font-bold text-orange-950 mb-4">Sélection du Maître Artisan</h2>
          <p className="text-orange-900/60 max-w-xl mx-auto italic">Des pièces uniques choisies pour leur rareté et la finesse de leur exécution.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16">
          {loading ? (
            <div className="col-span-full flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-900"></div>
            </div>
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-orange-900/60">Aucun produit en vedette pour le moment.</p>
            </div>
          )}
        </div>
        <div className="text-center mt-20">
          <Link to="/catalogue" className="inline-block border-b-2 border-orange-900 text-orange-950 font-bold pb-1 hover:text-orange-700 hover:border-orange-700 transition-all">
            Explorer toute la collection &rarr;
          </Link>
        </div>
      </section>

      {/* Trust & Heritage Section */}
      <section className="bg-orange-950 text-orange-50 py-24 zellige-pattern relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-orange-800/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-800/10 rounded-full translate-x-1/4 translate-y-1/4 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-16 text-center relative z-10">
          <div className="group">
            <div className="w-20 h-20 bg-orange-800/50 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <h3 className="text-2xl font-heritage font-bold mb-4">Authenticité Certifiée</h3>
            <p className="text-orange-100/70 leading-relaxed font-light">Chaque pièce est accompagnée d'un certificat d'origine garantissant le travail de la main marocaine.</p>
          </div>
          <div className="group">
            <div className="w-20 h-20 bg-orange-800/50 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="text-2xl font-heritage font-bold mb-4">Circuit Court Direct</h3>
            <p className="text-orange-100/70 leading-relaxed font-light">Nous connectons l'artisan au monde, assurant une rémunération juste sans intermédiaires commerciaux.</p>
          </div>
          <div className="group">
            <div className="w-20 h-20 bg-orange-800/50 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <h3 className="text-2xl font-heritage font-bold mb-4">Personnalisation</h3>
            <p className="text-orange-100/70 leading-relaxed font-light">Travaillez main dans la main avec le maître artisan pour créer une pièce qui s'adapte à votre espace de vie.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;