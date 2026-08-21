const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");
const { FOUR_SYMBOLS, addSymbol, activateSymbol, formation } = require("../systems/fourSymbols");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tutuong").setDescription("Quản lý Tứ Tượng")
    .addStringOption(o => o.setName("hanhdong").setDescription("xem / kichhoat / mo").setRequired(true)
      .addChoices({name:"Xem",value:"xem"},{name:"Kích hoạt",value:"kichhoat"},{name:"Mở thử nghiệm",value:"mo"}))
    .addStringOption(o => o.setName("tuong").setDescription("thanhlong / bachho / chutuoс / huyenvu")),
  async execute(interaction) {
    const id = interaction.user.id;
    const player = db.getPlayer(id) || db.createPlayer(id, interaction.user.username, interaction.user.displayAvatarURL());
    const action = interaction.options.getString("hanhdong");
    const symbol = interaction.options.getString("tuong");

    if (action === "mo" && symbol && FOUR_SYMBOLS[symbol]) {
      addSymbol(player, symbol);
      db.updatePlayer(id, player);
      return interaction.reply(`✨ Đã mở khóa **${FOUR_SYMBOLS[symbol].name}**.`);
    }

    if (action === "kichhoat" && symbol) {
      try {
        activateSymbol(player, symbol);
        db.updatePlayer(id, player);
        return interaction.reply(`🌌 Đã kích hoạt **${FOUR_SYMBOLS[symbol]?.name || symbol}**.`);
      } catch (e) {
        return interaction.reply({content:`❌ ${e.message}`, ephemeral:true});
      }
    }

    const owned = player.fourSymbols?.owned || [];
    const list = Object.values(FOUR_SYMBOLS).map(x =>
      `${owned.includes(x.id) ? "✅" : "🔒"} ${x.name} — ${x.element} — ${x.role}`
    ).join("\n");

    const embed = new EmbedBuilder().setTitle("🐉 TỨ TƯỢNG")
      .setDescription(list)
      .addFields(
        {name:"⚡ Resonance",value:String(player.fourSymbols?.resonance || 0),inline:true},
        {name:"🌌 Trận pháp",value:formation(player) || "Chưa mở",inline:true},
        {name:"🔥 Đang kích hoạt",value:player.fourSymbols?.active || "Chưa có",inline:true}
      );
    await interaction.reply({embeds:[embed]});
  }
};
