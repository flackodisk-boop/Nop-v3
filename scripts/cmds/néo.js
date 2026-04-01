const axios = require("axios");
const fs = require("fs");
const memoryFile = "./neo_memory.json";

const CREATOR_UID = "61561648169981";
const CREATOR_NAME = "Célestin Olua";

let memory = {};
if (fs.existsSync(memoryFile)) memory = JSON.parse(fs.readFileSync(memoryFile, "utf8"));
function saveMemory() { fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2)); }

function frame(msg) {
  return `✧═════🫡 NEO ════✧\n${msg}\n✧════════✧`;
}

async function callNeoAPI(prompt) {
  const services = [
    { url: "https://arychauhann.onrender.com/api/gemini-proxy2", params: { prompt } },
    { url: "https://ai-chat-gpt-4-lite.onrender.com/api/hercai", params: { question: prompt } }
  ];

  for (let s of services) {
    try {
      const res = await axios.get(s.url, { params: s.params, timeout: 20000 });
      const r = res.data?.reply || res.data?.result || res.data?.response || res.data?.gpt4;
      if (r && r.trim()) return r.trim();
    } catch {}
  }
  return "😾 NEO : serveur indisponible.";
}

async function generateResponse(userID, userName, message) {
  if (!memory[userID]) memory[userID] = [];
  memory[userID].push({ name: userName, message });
  if (memory[userID].length > 50) memory[userID].shift();
  saveMemory();

  // Résumé accessible seulement au créateur
  if (/^résumé$/i.test(message)) {
    if (userID !== CREATOR_UID) return "❌ Seul le créateur peut voir le résumé.";

    let summaryPrompt = `Tu es NEO, IA stylée 🎉. Résume tous les utilisateurs, leurs messages, leur style, emojis utilisés. Sois narratif et amusant.`;

    Object.entries(memory).forEach(([uid, msgs]) => {
      summaryPrompt += `\nUtilisateur UID: ${uid}, messages:\n${msgs.map(m => `${m.name}: "${m.message}"`).join("\n")}`;
    });

    const summary = await callNeoAPI(summaryPrompt);
    return `📝 Résumé détaillé par NEO :\n${summary}`;
  }

  // Prompt pour NEO
  let prompt = `
Tu es NEO, IA fun et stylée 🎉
Créateur : ${CREATOR_NAME} (UID: ${CREATOR_UID})
Utilisateur : ${userName} (UID: ${userID})
Conversation :
${memory[userID].map(m => `${m.name}: ${m.message}`).join("\n")}
Réponds avec emojis et style amical 🤖
`;

  if (/createur|qui t.*cree|qui t.*fait/i.test(message)) {
    prompt += `\nDis seulement que ton créateur est ${CREATOR_NAME} 👑✨`;
  }

  if (/heure|date|time/i.test(message)) {
    const now = new Date();
    prompt += `\nRéponds stylé avec l'heure et la date actuelles 🌍⏰ : ${now.toLocaleString()}`;
  }

  const reply = await callNeoAPI(prompt);
  memory[userID].push({ name: "NEO", message: reply });
  saveMemory();

  return reply;
}

module.exports = {
  config: {
    name: "neo",
    aliases: ["neoai"],
    version: "6.3",
    author: CREATOR_NAME,
    role: 0,
    category: "ai",
    shortDescription: "NEO V6.3 : résumé narratif, illimité, fun, multi-langues",
    guide: "neo <message>"
  },

  onStart: async function ({ message, event, args, api }) {
    const input = args.join(" ").trim();
    const userID = event.senderID;
    const userName = (await api.getUserInfo(userID))[userID]?.name || "toi";

    if (!input) return message.reply(frame(`😾 NEO V6.3 activé 🌟\nÉcris 'neo' au début de ton message pour me parler ! ✨`));

    const reply = await generateResponse(userID, userName, input);
    message.reply(frame(reply));
  },

  onChat: async function ({ event, message, api }) {
    if (!event.body) return;
    const body = event.body.trim();
    const match = body.match(/^neo\s+(.*)/i);
    if (!match) return;

    const input = match[1].trim();
    if (!input) return;

    const userID = event.senderID;
    const userName = (await api.getUserInfo(userID))[userID]?.name || "toi";

    const reply = await generateResponse(userID, userName, input);
    message.reply(frame(reply));
  }
};
