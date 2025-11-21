import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // CORS headers pour éviter les erreurs cross-origin
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée, utilise POST." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: "Corps de requête invalide (JSON attendu)." });
    }
  }

  const { message, messages } = body || {};

  // Support pour historique complet (messages) ou message simple
  let conversationMessages = [];
  
  if (messages && Array.isArray(messages)) {
    conversationMessages = messages;
  } else if (message && typeof message === "string") {
    conversationMessages = [
      {
        role: "system",
        content:
          "Tu es l'assistant dystopique-rétro du projet ouaisfi.eu, parlant comme un terminal des années 80. " +
          "Tu aides sur la citoyenneté, l'éducation permanente, les jeux pédagogiques, " +
          "les tests de recrutement bienveillants, la guerre narrative, la découverte critique des technologies. " +
          "Utilise parfois [SYSTÈME], [OK], [DONNÉES] dans tes réponses. Style terminal rétro. " +
          "Tu ne donnes jamais d'informations permettant d'identifier quelqu'un. " +
          "Tu expliques de manière accessible, structurée, sans jargon inutile."
      },
      {
        role: "user",
        content: message
      }
    ];
  } else {
    return res.status(400).json({ error: "Message ou messages manquant(s)." });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // Corrigé: c'était "gpt-4.1-mini" qui n'existe pas
      messages: conversationMessages,
      max_tokens: 600,
      temperature: 0.7
    });

    const reply = completion.choices?.[0]?.message?.content || "";

    // Support pour les deux formats de réponse
    return res.status(200).json({ 
      reply: reply,
      message: reply 
    });
  } catch (err) {
    console.error("Erreur OpenAI:", err);
    return res.status(500).json({ 
      error: "Erreur côté OpenAI ou serveur.",
      details: err.message 
    });
  }
}
