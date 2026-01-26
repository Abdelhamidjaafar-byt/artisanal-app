import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Marketplace from "./pages/Marketplace";
import ArtisanDashboard from "./pages/artisan/Dashboard";
import ProductForm from "./pages/artisan/ProductForm";
import ProductDetails from "./pages/ProductDetails";
import { MoveRight, Sparkles, Gem, ScrollText, History } from "lucide-react";
import { motion } from "framer-motion";

const Home = () => (
  <div className="container py-16">
    <div className="grid lg:grid-cols-2 gap-16 items-center">
      <motion.section 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8"
      >
        <div className="inline-flex items-center gap-2 bg-primary/10 px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] border border-primary/20 text-primary uppercase">
          <Sparkles size={14} /> The Soul of Moroccan Craft
        </div>
        <h1 className="text-7xl md:text-9xl font-black heading leading-[0.85] tracking-tighter">
          Mastery in <br />
          <span className="golden-text">Heritage.</span>
        </h1>
        <p className="text-text-muted text-xl max-w-lg leading-relaxed">
          From the heart of the Medina to the modern world. Discover authentic Moroccan artisanry, 
          hand-forged by the finest masters of the North.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
          <button className="bg-primary text-white px-10 py-5 rounded-2xl font-black flex items-center gap-3 hover:shadow-[0_0_30px_rgba(230,126,34,0.4)] transition-all uppercase tracking-widest text-xs">
            Enter Marketplace <MoveRight size={20} />
          </button>
          <button className="text-text-muted font-bold hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest text-xs">
            <History size={18} className="text-primary" /> Meet the Masters
          </button>
        </div>
      </motion.section>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative group h-[600px] w-full"
      >
        {/* Decorative Arch Frame */}
        <div className="absolute inset-0 border-8 border-primary/10 arch-frame translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500"></div>
        <div className="w-full h-full arch-frame bg-surface border border-primary/20 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[#1a1c22] opacity-40 mix-blend-overlay"></div>
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'var(--zellige-pattern)', backgroundSize: '40px 40px' }}></div>
            
            <div className="absolute inset-0 flex items-center justify-center p-12 text-center flex-col">
                <Gem size={80} className="text-primary/30 mb-6" />
                <h3 className="heading text-4xl mb-4 italic text-primary/80">"L'art est le reflet de l'âme du peuple"</h3>
                <p className="text-text-muted uppercase tracking-widest text-[10px]">Handcrafted in Marrakech • Fes • Chefchaouen</p>
            </div>
            
            {/* Golden corner frames */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-primary/40 rounded-tl-3xl"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-primary/40 rounded-br-3xl"></div>
        </div>
      </motion.div>
    </div>

    <section className="grid md:grid-cols-3 gap-8 mt-48">
      {[
        { title: "Imperial Rugs", desc: "Woven by the skilled hands of Atlas mountain tribes.", icon: <ScrollText size={32} /> },
        { title: "Zellige Tilework", desc: "Mathematical perfection in hand-cut geometric mosaics.", icon: <Sparkles size={32} /> },
        { title: "Hand-Hammered Brass", desc: "Intricate patterns forged in the souks of Fes.", icon: <Hammer size={32} /> }
      ].map((cat, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-surface p-10 rounded-3xl border border-border hover:border-primary/40 transition-all group zellige-card"
        >
          <div className="text-primary mb-6 group-hover:scale-110 transition-transform">{cat.icon}</div>
          <h3 className="text-3xl font-black mb-4 heading tracking-tight">{cat.title}</h3>
          <p className="text-text-muted leading-relaxed">{cat.desc}</p>
        </motion.div>
      ))}
    </section>
  </div>
);

const AppContent = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/artisan/dashboard" element={<ArtisanDashboard />} />
        <Route path="/artisan/product/new" element={<ProductForm />} />
        <Route path="/artisan/product/edit/:id" element={<ProductForm />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
