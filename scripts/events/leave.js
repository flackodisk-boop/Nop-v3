const { getTime, drive } = global.utils;

module.exports = {
	config: {
		name: "leave",
		version: "1.8",
		author: "NTKhang x Célestin 🔥",
		category: "events"
	},

	langs: {
		fr: {
			session1: "matin",
			session2: "midi",
			session3: "après-midi",
			session4: "soir",
			leaveType1: "a quitté",
			leaveType2: "a été expulsé",
			defaultLeaveMessage: "{userName} a quitté le groupe"
		}
	},

	onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
		if (event.logMessageType == "log:unsubscribe")
			return async function () {
				const { threadID } = event;
				const threadData = await threadsData.get(threadID);
				if (!threadData.settings.sendLeaveMessage) return;

				const { leftParticipantFbId } = event.logMessageData;
				if (leftParticipantFbId == api.getCurrentUserID()) return;

				const userName = await usersData.getName(leftParticipantFbId);

				let { leaveMessage = getLang("defaultLeaveMessage") } = threadData.data;

				const form = {
					mentions: leaveMessage.match(/\{userNameTag\}/g) ? [{
						tag: userName,
						id: leftParticipantFbId
					}] : null
				};

				// 🔥 Détection type (quitté ou expulsé)
				const isKicked = event.author && event.author != leftParticipantFbId;

				// 🕒 Heure actuelle
				const hour = new Date().getHours();
				let timeText = "🌙 Nuit sombre...";
				if (hour >= 5 && hour < 12) timeText = "🌅 Matin calme...";
				else if (hour >= 12 && hour < 17) timeText = "☀️ Plein jour...";
				else if (hour >= 17 && hour < 22) timeText = "🌆 Soirée active...";

				// 🎯 Messages QUITTÉ
				const leaveMsgs = [
`🇫🇷━━━━━━━━━━━━
${timeText}

💨 ${userName} est parti…
💅 Le style reste.
━━━━━━━━━━━━`,

`🇫🇷━━━━━━━━━━━━
${timeText}

👀 ${userName} a quitté.
🔥 Rien ne change.
━━━━━━━━━━━━`,

`🇫🇷━━━━━━━━━━━━
${timeText}

🫠 ${userName} a disparu.
👑 L’élite continue.
━━━━━━━━━━━━`
				];

				// 💀 Messages EXPULSÉ
				const kickMsgs = [
`🇫🇷━━━━━━━━━━━━
${timeText}

💀 ${userName} expulsé.
⚠️ Niveau insuffisant.
━━━━━━━━━━━━`,

`🇫🇷━━━━━━━━━━━━
${timeText}

🚫 ${userName} supprimé.
👑 Sélection naturelle.
━━━━━━━━━━━━`,

`🇫🇷━━━━━━━━━━━━
${timeText}

⚡ ${userName} éjecté.
🔥 Le groupe respire mieux.
━━━━━━━━━━━━`
				];

				// 🎲 Choix final
				const messages = isKicked ? kickMsgs : leaveMsgs;
				form.body = messages[Math.floor(Math.random() * messages.length)];

				if (leaveMessage.includes("{userNameTag}")) {
					form.mentions = [{
						id: leftParticipantFbId,
						tag: userName
					}];
				}

				if (threadData.data.leaveAttachment) {
					const files = threadData.data.leaveAttachment;
					const attachments = files.reduce((acc, file) => {
						acc.push(drive.getFile(file, "stream"));
						return acc;
					}, []);
					form.attachment = (await Promise.allSettled(attachments))
						.filter(({ status }) => status == "fulfilled")
						.map(({ value }) => value);
				}

				message.send(form);
			};
	}
};
