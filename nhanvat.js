const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");
const { CHARACTERS } = require("../systems/content");

module.exports = {
  data: new SlashCommandBuilder().setName("nhanvat").setDescription("Xem nhân vật và đồng hành"),
  async execute(interaction) {
    const player = db.getPlayer(interaction.user.id) || db.createPlayer(interaction.user.id, interaction.user.username);
    const owned = player.characters || [];
    const text = CHARACTERS.map(c => `${owned.includes(c.id) ? "⭐" : "🔒"} **${c.name}** — ${"⭐".repeat(c.rarity)} — ${c.role}`).join("\n");
    await interaction.reply({embeds:[new EmbedBuilder().setTitle("👤 NHÂN VẬT").setDescription(text).setFooter({text:"Mở khóa nhân vật qua nhiệm vụ, sự kiện và triệu hồi."})]});
  }
};
