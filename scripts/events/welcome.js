const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: "welcome",
    version: "2.0",
    author: "Célestin 👽⚽",
    category: "events"
  },

  onStart: async function ({ api, event, message }) {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID, logMessageData } = event;
    const { addedParticipants } = logMessageData;
    const hours = new Date().getHours();
    const prefix = getPrefix(threadID);
    const nickNameBot = global.GoatBot.config.nickNameBot;

    if (addedParticipants.some(user => user.userFbId === api.getCurrentUserID())) {
      if (nickNameBot) {
        try {
          await api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
        } catch (error) {
          console.error("❌ Erreur changement pseudo bot :", error);
        }
      }
      return;
    }

    const botID = api.getCurrentUserID();
    if (addedParticipants.some(u => u.userFbId === botID)) return;

    const threadInfo = await api.getThreadInfo(threadID);
    const groupName = threadInfo.threadName;
    const memberCount = threadInfo.participantIDs.length;

    for (const user of addedParticipants) {
      const userId = user.userFbId;
      const fullName = user.fullName;

      try {

        const timeStr = new Date().toLocaleString("fr-FR", {
          hour: "2-digit", minute: "2-digit", second: "2-digit",
          weekday: "long", year: "numeric", month: "2-digit", day: "2-digit",
          hour12: false,
        });

        // 🌞🌙 Détection jour / nuit
        const isDay = hours >= 6 && hours < 18;
        const greeting = isDay ? "🌞 Bonjour" : "🌙 Bonsoir";
        const moodLine = isDay
          ? "⚽ Passe une excellente journée dans le groupe 👽🔥"
          : "⚽ Passe une bonne nuit dans le groupe 👽🌙";

        const apiUrl = `https://xsaim8x-xxx-api.onrender.com/api/welcome?name=${encodeURIComponent(fullName)}&uid=${userId}&threadname=${encodeURIComponent(groupName)}&members=${memberCount}`;
        const tmp = path.join(__dirname, "..", "cache");
        await fs.ensureDir(tmp);
        const imagePath = path.join(tmp, `welcome_${userId}.png`);

        const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(imagePath, response.data);

        await api.sendMessage({
          body:
`🛸═══════⚽〔 🌌 𝐁𝐈𝐄𝐍𝐕𝐄𝐍𝐔𝐄 🌌 〕⚽═══════🛸
👽 ${greeting} ${fullName}
⚽ Bienvenue dans ${groupName}
👽 Tu es le ${memberCount}ᵉ membre ⚽

🛸━━━━━━━━━━━━━━━━━━🛸
${moodLine}
👽 Respecte tous les membres ⚽
🛸━━━━━━━━━━━━━━━━━━🛸

📡 ${timeStr}`,
          
          attachment: fs.createReadStream(imagePath),
          mentions: [{ tag: fullName, id: userId }]
        }, threadID);

        fs.unlinkSync(imagePath);

      } catch (err) {
        console.error("❌ Erreur envoi message bienvenue :", err);
      }
    }
  }
};
