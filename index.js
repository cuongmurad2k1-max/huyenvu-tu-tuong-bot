require("dotenv").config();
const {Client,GatewayIntentBits,Events}=require("discord.js");
const db=require("./database"),commands=require("./commands");
const factions=require("./data/config/factions.json");
const client=new Client({intents:[GatewayIntentBits.Guilds]});
const map=new Map(commands.map(x=>[x.data.name,x]));
client.once(Events.ClientReady,c=>console.log(`🐢 ${c.user.tag} ONLINE — HUYỀN VŨ MEGA`));
client.on(Events.InteractionCreate,async i=>{
 try{
  if(i.isChatInputCommand()){const c=map.get(i.commandName);if(c)return c.execute(i);}
  if(i.isButton()){
   const [type,uid,id]=i.customId.split(":");
   if(uid!==i.user.id)return i.reply({content:"❌ Menu này không thuộc về bạn.",ephemeral:true});
   if(type==="faction"){
    const f=factions.find(x=>x.id===id);if(!f)return i.reply({content:"❌ Không tìm thấy Tứ Tượng.",ephemeral:true});
    db.mutate(uid,p=>{p.faction=f.name;p.bloodline=f.name;p.attack+=(f.bonuses.attack||0);p.defense+=(f.bonuses.defense||0);p.speed+=(f.bonuses.speed||0);p.maxHp+=(f.bonuses.maxHp||0);p.hp=p.maxHp;return p});
    return i.update({content:`🌟 **THỨC TỈNH THÀNH CÔNG**\n🐾 ${f.name}\n🩸 Huyết mạch: **${f.name}**\n✨ Kỹ năng: ${f.skills.join(" • ")}`,embeds:[],components:[]});
   }
  }
 }catch(e){console.error(e);if(!i.replied&&!i.deferred)i.reply({content:"❌ Lỗi hệ thống: "+e.message,ephemeral:true}).catch(()=>{});}
});
if(!process.env.DISCORD_TOKEN)console.warn("⚠️ Thiếu DISCORD_TOKEN trong .env");
client.login(process.env.DISCORD_TOKEN);
