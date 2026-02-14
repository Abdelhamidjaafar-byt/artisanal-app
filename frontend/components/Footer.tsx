
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-orange-100 py-12 mt-20" style={{ backgroundColor: '#c9a6787a' }}>
            <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-16 h-16 moorish-arch flex items-center justify-center border-2 border-[#d48a24]/30 shadow-xl overflow-hidden">
                            <img
                                src="assets/DAR.png"
                                alt="Logo Dar Sanعa"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="w-70 h-20 flex items-center justify-center overflow-hidden">
                            <img
                                src="assets/DAR 2.png"
                                alt="Logo Dar Sanعa"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <p className="text-gray-500 max-w-sm">
                        La plateforme officielle dédiée à la valorisation et la digitalisation des métiers artisanaux traditionnels marocains. Soutenez l'authenticité.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-orange-950 mb-4">Navigation</h4>
                    <ul className="space-y-2 text-gray-500 text-sm">
                        <li><Link to="/about" className="hover:text-orange-700">À propos</Link></li>
                        <li><Link to="/artisans" className="hover:text-orange-700">Artisans</Link></li>
                        <li><Link to="/catalogue" className="hover:text-orange-700">Catalogue</Link></li>
                        <li><Link to="/contact" className="hover:text-orange-700">Contact</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-orange-950 mb-4">Légal</h4>
                    <ul className="space-y-2 text-gray-500 text-sm">
                        <li><Link to="/legal" className="hover:text-orange-700">Mentions légales</Link></li>
                        <li><Link to="/privacy" className="hover:text-orange-700">Protection des données</Link></li>
                        <li><Link to="/terms" className="hover:text-orange-700">Conditions de vente</Link></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 pt-12 mt-12 border-t border-orange-50 text-center text-gray-400 text-xs uppercase tracking-widest">
                © {new Date().getFullYear()} Artisanat Patrimoine Maroc. Tous droits réservés.
            </div>
        </footer>
    );
};

export default Footer;
