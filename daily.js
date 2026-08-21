const {SlashCommandBuilder,EmbedBuilder}=require("discord.js"); const {DAILY}=require("../systems/daily");
module.exports={data:new SlashCommandBuilder().setName("daily").setDescription("Nhiệm vụ hàng ngày"),async execute(i){
 await i.reply({embeds:[new EmbedBuilder().setTitle("📅 NHIỆM VỤ HÀNG NGÀY").setDescription(DAILY.map(x=>`• ${x.name}`).join("\n"))]});
}};
