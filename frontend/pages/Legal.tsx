
import React from 'react';

const Legal: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-heritage font-bold text-orange-950 mb-12">Mentions Légales</h1>
            <div className="prose prose-orange max-w-none space-y-8">
                <section>
                    <h2 className="text-2xl font-bold text-orange-900 mb-4">Éditeur de la plateforme</h2>
                    <p className="text-gray-600">
                        Le site Dar Sanعa est édité par l'Association Patrimoine Artisanal Maroc, dont le siège social est situé à Casablanca, Maroc.
                    </p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-orange-900 mb-4">Hébergement</h2>
                    <p className="text-gray-600">
                        Ce site est hébergé localement pour les besoins du développement.
                    </p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-orange-900 mb-4">Propriété Intellectuelle</h2>
                    <p className="text-gray-600">
                        L'ensemble des contenus (textes, images, logos) présents sur le site sont la propriété exclusive de Dar Sanعa ou de ses artisans partenaires.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Legal;
