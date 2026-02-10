
import React from 'react';

const About: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-heritage font-bold text-orange-950 mb-8 text-center">À Propos de Dar Sanعa</h1>
            <div className="prose prose-orange lg:prose-xl mx-auto">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    Dar Sanعa est né d'une passion profonde pour le patrimoine artisanal marocain. Notre mission est de créer un pont entre les maîtres artisans et le monde moderne, en offrant une vitrine digitale à des savoir-faire séculaires.
                </p>
                <div className="grid md:grid-cols-2 gap-8 my-12">
                    <div className="bg-orange-50 p-6 rounded-3xl">
                        <h3 className="text-xl font-bold text-orange-900 mb-4">Notre Mission</h3>
                        <p className="text-gray-600">Préserver et promouvoir l'artisanat traditionnel marocain en facilitant l'accès au marché digital pour les artisans.</p>
                    </div>
                    <div className="bg-orange-50 p-6 rounded-3xl">
                        <h3 className="text-xl font-bold text-orange-900 mb-4">Notre Vision</h3>
                        <p className="text-gray-600">Devenir la référence mondiale pour l'authenticité et la qualité marocaine, tout en assurant une rémunération juste aux créateurs.</p>
                    </div>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed italic border-l-4 border-orange-200 pl-6">
                    "Chaque objet raconte une histoire, chaque geste est un héritage."
                </p>
            </div>
        </div>
    );
};

export default About;
