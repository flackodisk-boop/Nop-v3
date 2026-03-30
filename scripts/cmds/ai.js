module.exports = {
  config: {
    name: "ai",
    version: "1.0",
    author: "Celestin 👽⚽",
    countDown: 2,
    role: 0,
    shortDescription: "AI indisponible",
    longDescription: "Indique que l'IA est temporairement indisponible",
    category: "ai",
    guide: "{pn} ai"
  },

  onStart: async function ({ message, event, args }) {
    return message.reply(
`🛸════════════════🛸
👽 ⚽ IA momentanément indisponible ⚽ 👽
🛸════════════════🛸

⚡ Pour continuer :
🌌 flash
🌌 neo

👾 Merci pour votre patience et que le football extraterrestre soit avec vous ! ⚽🛸`
    );
  }
};
