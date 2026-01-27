import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for social auth token in URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userData = params.get("user");

    if (token && userData) {
      const parsedUser = JSON.parse(decodeURIComponent(userData));
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(parsedUser));
      setUser(parsedUser);
      
      // Redirect based on role
      if (parsedUser.role === "ARTISAN") {
        navigate("/artisan/dashboard");
      } else {
        navigate("/marketplace");
      }
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    setLoading(false);
  }, [navigate]);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user: userData } = response.data;
    
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const response = await api.post("/auth/register", userData);
    const { token, user: registeredUser } = response.data;
    if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(registeredUser));
        setUser(registeredUser);
    }
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
