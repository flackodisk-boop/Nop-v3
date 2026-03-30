const { getTime, drive } = global.utils;

module.exports = {
  config: {
    name: "leave",
    version: "1.4 👑",
    author: "NTKhang",
    category: "événements"
  },

  langs: {
    fr: {
      session1: "matin",
      session2: "midi",
      session3: "après-midi",
      session4: "soir",
      leaveType1: "a quitté",
      leaveType2: "a été expulsé de",
      defaultLeaveMessage: "👑 {userName} {type} le groupe {threadName} 🌹"
    },
    en: {
      session1: "morning",
      session2: "noon",
      session3: "afternoon",
      session4: "evening",
      leaveType1: "left",
      leaveType2: "was kicked from",
      defaultLeaveMessage: "{userName} {type} the group {threadName}"
    }
  },

  onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
    if (event.logMessageType !== "log:unsubscribe") return;

    return async function () {
      const { threadID } = event;
      const threadData = await threadsData.get(threadID);
      if (!threadData.settings.sendLeaveMessage) return;

      const { leftParticipantFbId } = event.logMessageData;
      if (leftParticipantFbId === api.getCurrentUserID()) return;

      const hours = getTime("HH");
      const threadName = threadData.threadName;
      const userName = await usersData.getName(leftParticipantFbId);

      // Message par défaut ou personnalisé
      let { leaveMessage = getLang("defaultLeaveMessage") } = threadData.data;

      leaveMessage = leaveMessage
        .replace(/\{userName\}|\{userNameTag\}/g, userName)
        .replace(/\{type\}/g, leftParticipantFbId === event.author ? getLang("leaveType1") : getLang("leaveType2"))
        .replace(/\{threadName\}|\{boxName\}/g, threadName)
        .replace(/\{time\}/g, hours)
        .replace(/\{session\}/g, hours <= 10 ? getLang("session1") :
                              hours <= 12 ? getLang("session2") :
                              hours <= 18 ? getLang("session3") :
                              getLang("session4"));

      const form = {
        body: leaveMessage,
        mentions: leaveMessage.includes("{userNameTag}") ? [{
          id: leftParticipantFbId,
          tag: userName
        }] : null
      };

      // Gestion des pièces jointes
      if (threadData.data.leaveAttachment) {
        const attachments = await Promise.allSettled(
          threadData.data.leaveAttachment.map(file => drive.getFile(file, "stream"))
        );
        form.attachment = attachments
          .filter(a => a.status === "fulfilled")
          .map(a => a.value);
      }

      message.send(form);
    };
  }
};
