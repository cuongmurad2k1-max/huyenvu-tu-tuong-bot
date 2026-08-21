const {SlashCommandBuilder,EmbedBuilder}=require("discord.js"); const {PROFESSIONS}=require("../systems/professions");
module.exports={data:new SlashCommandBuilder().setName("nghe").setDescription("Xem nghề nghiệp"),async execute(i){
 await i.reply({embeds:[new EmbedBuilder().setTitle("🛠️ NGHỀ NGHIỆP").setDescription(PROFESSIONS.map(x=>`• **${x.name}** — Mastery tối đa ${x.max}`).join("\n"))]});
}};
