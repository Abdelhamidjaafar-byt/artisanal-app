
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateProductDescription = async (title: string, category: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Génère une description poétique et commerciale pour un produit artisanal marocain.
      Nom du produit: ${title}
      Catégorie: ${category}
      La description doit mettre en avant le travail manuel, l'héritage et l'authenticité marocaine.`,
    });
    return response.text || "Impossible de générer une description pour le moment.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Erreur lors de la génération.";
  }
};

export const getArtisanAdvisorResponse = async (query: string, artisanContext: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tu es un conseiller expert pour les artisans traditionnels marocains. Aide l'artisan avec sa question: "${query}".
      Contexte de l'artisan: ${artisanContext}.
      Réponds en français avec un ton chaleureux et respectueux.`,
    });
    return response.text || "Je n'ai pas pu trouver de réponse.";
  } catch (error) {
    console.error("AI Advisor Error:", error);
    return "Désolé, je rencontre des difficultés techniques.";
  }
};
