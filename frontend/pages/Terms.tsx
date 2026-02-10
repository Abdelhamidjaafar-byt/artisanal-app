
import React from 'react';

const Terms: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-heritage font-bold text-orange-950 mb-12">Conditions de Vente</h1>
            <div className="prose prose-orange max-w-none space-y-8">
                <section>
                    <h2 className="text-2xl font-bold text-orange-900 mb-4">Vente d'artisanat</h2>
                    <p className="text-gray-600">
                        Chaque produit étant fabriqué à la main, de légères variations de couleur, de forme ou de dimension peuvent exister par rapport aux photographies.
                    </p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-orange-900 mb-4">Délais de fabrication</h2>
                    <p className="text-gray-600">
                        Pour les commandes sur mesure, un délai de fabrication de 2 à 4 semaines sera communiqué par l'artisan.
                    </p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-orange-900 mb-4">Livraison</h2>
                    <p className="text-gray-600">
                        Les délais de livraison varient selon la région et le type de produit.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Terms;
