const {SlashCommandBuilder,EmbedBuilder}=require("discord.js");
const db=require("../database"); const {DESTINIES}=require("../systems/destiny");
module.exports={data:new SlashCommandBuilder().setName("thienmenh").setDescription("Xem Thiên Mệnh"),async execute(i){
 const p=db.getPlayer(i.user.id)||db.createPlayer(i.user.id,i.user.username);
 const txt=DESTINIES.map(d=>`${p.destiny===d.id?"🌟":"🔒"} **${d.name}** — ${"⭐".repeat(d.rarity)}`).join("\n");
 await i.reply({embeds:[new EmbedBuilder().setTitle("🌌 THIÊN MỆNH").setDescription(txt).addFields({name:"Hiện tại",value:p.destiny||"Chưa thức tỉnh"})]});
}};
