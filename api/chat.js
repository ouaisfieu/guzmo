// api/chat.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // définie dans Vercel → Settings → Environment Variables
});

export default async function handler(req, res) {
  // On accepte uniquement les requêtes POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée, utilise POST." });
  }

  // Récupération du message envoyé par le navigateur
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: "Corps de requête invalide (JSON attendu)." });
    }
  }

  const { message } = body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message manquant ou invalide." });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini", // modèle léger et pas trop cher
      messages: [
        {
          role: "system",
          content:
            "Tu es l’assistant du projet ouaisfi.eu. " +
            "Tu aides sur la citoyenneté, l’éducation permanente, les jeux pédagogiques, " +
            "les tests de recrutement bienveillants, la guerre narrative, la découverte critique des technologies. " +
            "Tu ne donnes jamais d’informations permettant d’identifier quelqu’un dans la vraie vie. " +
            "Tu expliques de manière accessible, structurée, sans jargon inutile."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 600,
      temperature: 0.6
    });

    const reply = completion.choices?.[0]?.message?.content || "";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Erreur OpenAI:", err);
    return res.status(500).json({ error: "Erreur côté OpenAI ou serveur." });
  }
}
