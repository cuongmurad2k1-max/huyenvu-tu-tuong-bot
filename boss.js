const {SlashCommandBuilder,EmbedBuilder}=require("discord.js");
const {BOSSES}=require("../systems/content"); const {WORLD_BOSSES}=require("../systems/worldBoss");
module.exports={data:new SlashCommandBuilder().setName("boss").setDescription("Xem Boss"),async execute(i){
 const text=[...BOSSES.map(b=>`👑 **${b.name}** — HP ${b.hp.toLocaleString()} — ${b.phases} phase`),...WORLD_BOSSES.map(b=>`🌍 **${b.name}** — HP ${b.hp.toLocaleString()} — ${b.phase} phase`)].join("\n");
 await i.reply({embeds:[new EmbedBuilder().setTitle("👑 HỆ THỐNG BOSS").setDescription(text)]});
}};
