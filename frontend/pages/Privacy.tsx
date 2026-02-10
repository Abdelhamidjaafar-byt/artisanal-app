
import React from 'react';

const Privacy: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-heritage font-bold text-orange-950 mb-12">Protection des Données</h1>
            <div className="prose prose-orange max-w-none space-y-8">
                <p className="text-gray-600">
                    Chez Dar Sanعa, nous accordons une importance capitale à la protection de votre vie privée et de vos données personnelles.
                </p>
                <section>
                    <h2 className="text-2xl font-bold text-orange-900 mb-4">Collecte des données</h2>
                    <p className="text-gray-600">
                        Nous collectons uniquement les informations nécessaires au traitement de vos commandes et à l'amélioration de votre expérience.
                    </p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-orange-900 mb-4">Utilisation des cookies</h2>
                    <p className="text-gray-600">
                        Le site utilise des cookies de session pour maintenir votre panier et votre connexion.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Privacy;
