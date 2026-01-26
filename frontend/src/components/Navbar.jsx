import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Hammer, LogOut, Menu } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="glass sticky top-0 z-50 py-4 px-6 mb-8">
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <Hammer className="text-background" size={24} />
          </div>
          <span className="text-2xl font-bold golden-text uppercase tracking-tighter">Artisan</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-text-muted">
          <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
          {user?.role === "ARTISAN" && (
            <Link to="/artisan/dashboard" className="hover:text-primary transition-colors">Artisan Portal</Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-primary">{user.role}</span>
                <span className="text-sm">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-surface-hover rounded-full transition-colors"
                title="Logout"
              >
                <LogOut size={20} className="text-text-muted" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
              <Link to="/register" className="bg-primary text-background px-6 py-2 rounded-full text-sm font-bold hover:bg-primary-hover transition-all">Join as Artisan</Link>
            </div>
          )}
          <button className="md:hidden p-2">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
