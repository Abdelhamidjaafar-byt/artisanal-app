import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import { MoveRight, Star, PenTool, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const Home = () => (
  <div className="container py-12">
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6 max-w-3xl mx-auto"
    >
      <div className="flex justify-center">
        <span className="flex items-center gap-2 bg-surface px-4 py-1.5 rounded-full text-xs font-bold border border-border text-primary">
          <Sparkles size={14} /> NEW DESTINATION FOR ARTISANS
        </span>
      </div>
      <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none">
        Crafted by <br />
        <span className="golden-text">Master Hands.</span>
      </h1>
      <p className="text-text-muted text-lg max-w-xl mx-auto">
        Discover unique, high-quality handcrafted pieces directly from creators worldwide. 
        Luxury and authenticity in every stitch and stroke.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button className="bg-primary text-background px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform">
          Shop the Collection <MoveRight size={20} />
        </button>
        <button className="bg-surface border border-border px-8 py-4 rounded-full font-bold hover:bg-surface-hover transition-colors">
          Learn Our Story
        </button>
      </div>
    </motion.section>

    <section className="grid md:grid-cols-3 gap-8 mt-24">
      {[
        { title: "Bespoke Jewelry", icon: <Star size={32} /> },
        { title: "Leather Works", icon: <PenTool size={32} /> },
        { title: "Fine Pottery", icon: <Sparkles size={32} /> }
      ].map((cat, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-surface p-8 rounded-3xl border border-border hover:border-primary/50 transition-colors group cursor-pointer"
        >
          <div className="text-primary mb-4 group-hover:scale-110 transition-transform">{cat.icon}</div>
          <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
          <p className="text-text-muted text-sm">Explore masterfully crafted {cat.title.toLowerCase()} from elite artisans.</p>
        </motion.div>
      ))}
    </section>
  </div>
);

const AppContent = () => {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<div className="container">Marketplace Coming Soon</div>} />
          <Route path="/login" element={<div className="container">Login Coming Soon</div>} />
          <Route path="/register" element={<div className="container">Register Coming Soon</div>} />
          <Route path="/artisan/dashboard" element={<div className="container">Artisan Dashboard Coming Soon</div>} />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
