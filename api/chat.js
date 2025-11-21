// api/chat.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // <-- ta clé dans les variables d'env Vercel
});

export default async function handler(req, res) {
  // Autoriser uniquement POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { message } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message manquant ou invalide" });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini", // modèle léger, pas cher
      messages: [
        {
          role: "system",
          content:
            "Tu es l’assistant du projet ouaisfi.eu. " +
            "Tu aides sur la citoyenneté, l’éducation permanente, les jeux pédagogiques, " +
            "les tests de recrutement bienveillants, les guerres narratives et hybrides. " +
            "Tu ne donnes jamais d’informations d’identité réelle sur qui que ce soit. " +
            "Tu expliques de façon accessible, structurée, sans jargon inutile.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 600,
      temperature: 0.6,
    });

    const reply = completion.choices?.[0]?.message?.content || "";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Erreur OpenAI:", err);
    return res.status(500).json({ error: "Erreur côté OpenAI" });
  }
}
