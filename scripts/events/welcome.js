const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { getPrefix } = global.utils;
m
odule.exports = {
  config: {
    name: "welcome",
    version: "2.1",
    author: "Saimx69x x Célestin 🔥",
    category: "events"
  },
 
 onStart: async function ({ api, event, message }) {
    if (event.logMessageType !== "log:subscribe") return;
 
   const { threadID, logMessageData } = event;
    const { addedParticipants } = logMessageData;
    const hours = new Date().getHours();
    const prefix = getPrefix(threadID);
    const nickNameBot = global.GoatBot.config.nickNameBot;
 
   // Bot nick set function
    if (addedParticipants.some(user => user.userFbId === api.getCurrentUserID())) {
      if (nickNameBot) {
        try {
          await api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
        } catch (error) {
          console.error("❌ Error changing bot nickname:", error);
        }
      }
 
     const timeStr = new Date().toLocaleString("fr-FR");
 
     await api.sendMessage(
`🇫🇷━━━━━━━━━━━━━━━━━━━━
🤖 SYSTÈME ACTIVÉ
━━━━━━━━━━━━━━━━━━━━
⚡
 Connexion établie avec succès
🧠 Intelligence prête à fonctionner
�
� Préfixe : ${prefix}
💠 Nom : ${nickNameBot || "Bot"}
━
━━━━━━━━━━━━━━━━━━━
🔗 GitHub :
https://github.com/celestincelestinolua-cmyk/Flemme
�
� Créateur :
https://www.facebook.com/mike.lumema
━
━━━━━━━━━━━━━━━━━━━
💬 Tape ${prefix}help pour voir mes commandes
🕒 ${timeStr}
━
━━━━━━━━━━━━━━━━━━━
🔥 Bot opérationnel • Prêt à servir
━━━━━━━━━━━━━━━━━━━━`,
        threadID
      );
 
     return;
    }
 
   // Original welcome code for new users
    const botID = api.getCurrentUserID();

       if (addedParticipants.some(u => u.userFbId === botID)) return;
 
   const threadInfo = await api.getThreadInfo(threadID);
    const groupName = threadInfo.threadName;
    const memberCount = threadInfo.participantIDs.length;
 
   for (const user of addedParticipants) {
      const userId = user.userFbId;
      const fullName = user.fullName;
 
     try {

               const timeStr = new Date().toLocaleString("fr-FR");
 
       const apiUrl = `https://xsaim8x-xxx-api.onrender.com/api/welcome?name=${encodeURIComponent(fullName)}&uid=${userId}&threadname=${encodeURIComponent(groupName)}&members=${memberCount}`;
        const tmp = path.join(__dirname, "..", "cache");
        await fs.ensureDir(tmp);
        const imagePath = path.join(tmp, `welcome_${userId}.png`);
 
       const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(imagePath, response.data);
 
       await api.sendMessage({
          body:
`🇫🇷━━━━━━━━━━━━━━━━━━━━
✨ BIENVENUE
━━━━━━━━━━━━━━━━━━━━
�
� Salut ${fullName},
Bienvenue dans :
🏷️ ${groupName}
�
� Membres : ${memberCount}
💎 Tu fais maintenant partie du groupe
━
━━━━━━━━━━━━━━━━━━━
💬 Respect • Bonne ambiance • Participation
🔥 Profite et fais ta place !
━
━━━━━━━━━━━━━━━━━━━
🕒 ${timeStr}
━━━━━━━━━━━━━━━━━━━━`,
          attachment: fs.createReadStream(imagePath),
          mentions: [{ tag: fullName, id: userId }]
       } , threadID);
 
       fs.unlinkSync(imagePath);
 
     } catch (err) {
        console.error("❌ Error sending welcome message:", err);
     } 
   } 
 } 
};   
