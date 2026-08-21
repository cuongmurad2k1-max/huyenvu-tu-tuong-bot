const {SlashCommandBuilder,EmbedBuilder}=require("discord.js"); const {WORLD_BOSSES}=require("../systems/worldBoss");
module.exports={data:new SlashCommandBuilder().setName("bossworld").setDescription("Boss toàn server"),async execute(i){
 await i.reply({embeds:[new EmbedBuilder().setTitle("🌍 WORLD BOSS").setDescription(WORLD_BOSSES.map(x=>`👑 **${x.name}**\n❤️ ${x.hp.toLocaleString()} HP\n⚔️ ${x.attack.toLocaleString()} ATK\n`).join("\n"))]});
}};
