const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "admin",
		version: "1.7",
		author: "NTKhang 🌙⚽👑",
		countDown: 5,
		role: 2,
		description: {
			vi: "Thêm, xóa, sửa quyền admin 🌙⚽👑",
			en: "Add, remove, edit admin role 🌙⚽👑"
		},
		category: "box chat",
		guide: {
			vi: '   {pn} [add | -a] <uid | @tag>: Thêm quyền admin cho người dùng 🌙⚽👑'
				+ '\n	  {pn} [remove | -r] <uid | @tag>: Xóa quyền admin của người dùng 🌙⚽👑'
				+ '\n	  {pn} [list | -l]: Liệt kê danh sách admin 🏆✨',
			en: '   {pn} [add | -a] <uid | @tag>: Add admin role for user 🌙⚽👑'
				+ '\n	  {pn} [remove | -r] <uid | @tag>: Remove admin role of user 🌙⚽👑'
				+ '\n	  {pn} [list | -l]: List all admins 🏆✨'
		}
	},

	langs: {
		fr: {
			added: "✅ | 🌙⚽👑 Admin ajouté pour %1 utilisateurs :\n%2 ✨",
			alreadyAdmin: "\n⚠️ | ⚽🌙 %1 utilisateurs avaient déjà le rôle admin :\n%2",
			missingIdAdd: "⚠️ | 👑🌙 Veuillez entrer l'ID ou tag de l'utilisateur pour ajouter le rôle admin",
			removed: "✅ | 🌙⚽👑 Admin retiré pour %1 utilisateurs :\n%2 ✨",
			notAdmin: "⚠️ | ⚽🌙 %1 utilisateurs n'avaient pas le rôle admin :\n%2",
			missingIdRemove: "⚠️ | 👑🌙 Veuillez entrer l'ID ou tag de l'utilisateur pour retirer le rôle admin",
			listAdmin: (admins) => {
				let msg = "👑🌙🏆 Classement Royal des Admins ⚽✨\n";
				admins.sort((a,b) => b.level - a.level); // Le meilleur en haut
				for (let i = 0; i < admins.length; i++) {
					const stars = "⭐".repeat(admins[i].level || 1);
					msg += `\n${i+1}. ${admins[i].name} (${admins[i].uid}) ${stars} ⚽`;
				}
				msg += `\n\n🌟 Que le meilleur gagne ! 🌟`;
				return msg;
			}
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
		switch (args[0]) {
			case "add":
			case "-a": {
				if (args[1]) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions);
					else if (event.messageReply)
						uids.push(event.messageReply.senderID);
					else
						uids = args.filter(arg => !isNaN(arg));
					const notAdminIds = [];
					const adminIds = [];
					for (const uid of uids) {
						if (config.adminBot.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}

					config.adminBot.push(...notAdminIds);
					const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
					// Ajouter un niveau pour le classement
					const admins = getNames.map(({ uid, name }) => ({
						uid,
						name,
						level: 1 // niveau de départ
					}));
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
					return message.reply(
						(notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
						+ (adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length, adminIds.map(uid => `• ${uid}`).join("\n")) : "")
					);
				}
				else
					return message.reply(getLang("missingIdAdd"));
			}
			case "remove":
			case "-r": {
				if (args[1]) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions)[0];
					else
						uids = args.filter(arg => !isNaN(arg));
					const notAdminIds = [];
					const adminIds = [];
					for (const uid of uids) {
						if (config.adminBot.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}
					for (const uid of adminIds)
						config.adminBot.splice(config.adminBot.indexOf(uid), 1);
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
					return message.reply(
						(adminIds.length > 0 ? getLang("removed", adminIds.length, adminIds.map(uid => `• ${uid}`).join("\n")) : "")
						+ (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
					);
				}
				else
					return message.reply(getLang("missingIdRemove"));
			}
			case "list":
			case "-l": {
				const getNames = await Promise.all(config.adminBot.map(uid => usersData.getName(uid).then(name => ({
					uid,
					name,
					level: Math.floor(Math.random() * 5) + 1 // Niveau aléatoire pour le fun
				}))));
				return message.reply(getLang("listAdmin", getNames));
			}
			default:
				return message.SyntaxError();
		}
	}
};
