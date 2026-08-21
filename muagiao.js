const {SlashCommandBuilder,EmbedBuilder}=require("discord.js"); const {TERRITORIES}=require("../systems/territory");
module.exports={data:new SlashCommandBuilder().setName("lanhtho").setDescription("Xem lãnh thổ"),async execute(i){
 await i.reply({embeds:[new EmbedBuilder().setTitle("🏰 CHIẾN TRANH LÃNH THỔ").setDescription(TERRITORIES.map(x=>`🏰 ${x}`).join("\n"))]});
}};
