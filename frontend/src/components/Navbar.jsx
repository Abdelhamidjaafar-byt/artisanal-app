import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Compass, Hammer, LogOut, Menu, User } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="glass sticky top-0 z-50 py-5 px-6 border-b border-white/5">
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl shadow-[0_0_15px_rgba(230,126,34,0.3)]">
            <Compass className="text-white" size={24} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-2xl font-black golden-text uppercase tracking-tighter heading">Medina</span>
            <span className="text-[10px] text-text-muted uppercase tracking-[0.2em] ml-0.5">Artisans</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-[0.15em] text-text-muted">
          <Link to="/marketplace" className="hover:text-primary transition-all flex items-center gap-2">
            Marketplace
          </Link>
          {user?.role === "ARTISAN" && (
            <Link to="/artisan/dashboard" className="text-majorelle hover:brightness-125 transition-all">
              Artisan Guild
            </Link>
          )}
        </div>

        <div className="flex items-center gap-5">
          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{user.role}</span>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                 <button className="p-2 bg-surface rounded-lg hover:text-primary transition-colors">
                    <User size={18} />
                 </button>
                 <button 
                    onClick={handleLogout}
                    className="p-2 bg-surface rounded-lg hover:text-red-500 transition-colors"
                  >
                    <LogOut size={18} />
                  </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-sm font-bold hover:text-primary transition-colors uppercase tracking-widest">Login</Link>
              <Link to="/register" className="bg-primary text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
                Join Guild
              </Link>
            </div>
          )}
          <button className="md:hidden p-2 text-text-muted">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
