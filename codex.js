const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { CHARACTERS, MONSTERS, BOSSES, ITEMS } = require("../systems/content");
module.exports = {
 data:new SlashCommandBuilder().setName("codex").setDescription("Xem bộ sưu tập thế giới"),
 async execute(interaction){
  const e=new EmbedBuilder().setTitle("📚 HUYỀN VŨ CODEX")
   .addFields(
    {name:"👤 Nhân vật",value:String(CHARACTERS.length),inline:true},
    {name:"👹 Quái vật",value:String(MONSTERS.length),inline:true},
    {name:"👑 Boss",value:String(BOSSES.length),inline:true},
    {name:"💎 Vật phẩm",value:String(ITEMS.length),inline:true}
   );
  await interaction.reply({embeds:[e]});
 }
};
