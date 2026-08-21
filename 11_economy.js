// Auto-grouped command bundle. Contains 26 slash commands.
const commands = [];
// Shared helper inlined to keep the upload to 19 files.
const __db = require("../database");
function player(i) { return __db.getPlayer(i.user.id) || __db.createPlayer(i.user.id, i.user.username, i.user.displayAvatarURL()); }
function save(i,p) { __db.updatePlayer(i.user.id,p); return p; }
function ensure(p,key,fallback) { if (p[key]===undefined || p[key]===null) p[key]=fallback; return p[key]; }
function num(p,key,fallback=0) { p[key]=Number(p[key] ?? fallback); if(!Number.isFinite(p[key])) p[key]=fallback; return p[key]; }
function reply(i,text) { return i.reply({content:text}); }

// --- linhcanh.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("linhcanh")
    .setDescription("Xem linh cảnh"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🌌 LINH CẢNH")
      .setDescription("Xem các Linh Cảnh và điều kiện mở khóa.")
      .addFields(
        { name: "👤 Người chơi", value: p.username || interaction.user.username, inline: true },
        { name: "📍 Vị trí", value: p.location || "Bắc Minh", inline: true },
        { name: "⭐ Cấp", value: String(p.level || 1), inline: true }
      )
      .setFooter({ text: "Huyền Vũ Tứ Tượng • Ultimate" });
    await interaction.reply({ embeds: [embed] });
  }
 };
})());
// --- linhthu.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("linhthu")
    .setDescription("Xem linh thú"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🐉 LINH THÚ")
      .setDescription("Xem danh sách linh thú và tiến hóa.")
      .addFields(
        { name: "👤 Người chơi", value: p.username || interaction.user.username, inline: true },
        { name: "📍 Vị trí", value: p.location || "Bắc Minh", inline: true },
        { name: "⭐ Cấp", value: String(p.level || 1), inline: true }
      )
      .setFooter({ text: "Huyền Vũ Tứ Tượng • Ultimate" });
    await interaction.reply({ embeds: [embed] });
  }
 };
})());
// --- mail_nhan.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mail_nhan").setDescription("Nhận thư"),
  async execute(i) {
    const p=player(i); const unread=(p.mail||[]).filter(x=>!x.read).length; p.mail=(p.mail||[]).map(x=>({...x,read:true})); save(i,p); return reply(i,`✉️ Đã đọc **${unread}** thư.`);
  }
 };
})());
// --- mo_ban_do.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mo_ban_do").setDescription("Mở bản đồ"),
  async execute(i) {
    const p=player(i);p.mapProgress=(p.mapProgress||0)+10;save(i,p);return reply(i,`🗺️ Bản đồ khám phá ${p.mapProgress}%.`);
  }
 };
})());
// --- mo_banner.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mo_banner").setDescription("Mở banner"),
  async execute(i) {
    const p=player(i); p.gacha ||= {pulls:0,pity:0}; p.gacha.pulls++; p.gacha.pity++; const rare=p.gacha.pity>=50||Math.random()<.05; if(rare)p.gacha.pity=0; save(i,p); return reply(i,rare?"🌟 Gacha ra vật phẩm **5★**!":"🎴 Gacha ra vật phẩm **3★**.");
  }
 };
})());
// --- mua_nha.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mua_nha").setDescription("Mua nhà"),
  async execute(i) {
    const p=player(i);p.house ||= {level:1,buildings:{}};p.house.owned=true;save(i,p);return reply(i,"🏠 Bạn đã sở hữu một căn nhà.");
  }
 };
})());
// --- muagiao.js ---
commands.push((function() {
const {SlashCommandBuilder,EmbedBuilder}=require("discord.js"); const {TERRITORIES}=require("../systems");
return { data:new SlashCommandBuilder().setName("lanhtho").setDescription("Xem lãnh thổ"),async execute(i){
 await i.reply({embeds:[new EmbedBuilder().setTitle("🏰 CHIẾN TRANH LÃNH THỔ").setDescription(TERRITORIES.map(x=>`🏰 ${x}`).join("\n"))]});
} };
})());
// --- muasam.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("muasam")
    .setDescription("Mua sắm"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🛒 MUA SẮM")
      .setDescription("Xem các cửa hàng.")
      .addFields(
        { name: "👤 Người chơi", value: p.username || interaction.user.username, inline: true },
        { name: "📍 Vị trí", value: p.location || "Bắc Minh", inline: true },
        { name: "⭐ Cấp", value: String(p.level || 1), inline: true }
      )
      .setFooter({ text: "Huyền Vũ Tứ Tượng • Ultimate" });
    await interaction.reply({ embeds: [embed] });
  }
 };
})());
// --- nhan_thu_hang.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("nhan_thu_hang").setDescription("Nhận phần thưởng rank"),
  async execute(i) {
    const p=player(i);num(p,"coins");p.coins+=1000;save(i,p);return reply(i,"🏆 Nhận 1000 Gold thưởng xếp hạng.");
  }
 };
})());
// --- nhan_thuong.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("nhan_thuong").setDescription("Nhận thưởng"),
  async execute(i) {
    const p=player(i); num(p,"coins"); p.coins+=250; p.exp=(p.exp||0)+50; save(i,p); return reply(i,"🎁 +250 Gold và +50 EXP.");
  }
 };
})());
// --- nhanexp.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("nhanexp").setDescription("Nhận EXP"),
  async execute(i) {
    const p=player(i); num(p,"exp",0); p.exp+=50; save(i,p); return reply(i,`✨ +50 EXP. Tổng: **${p.exp}**`);
  }
 };
})());
// --- nhangem.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("nhangem").setDescription("Nhận ngọc"),
  async execute(i) {
    const p=player(i); num(p,"gems",0); p.gems+=10; save(i,p); return reply(i,`💎 +10 Gems. Tổng: **${p.gems}**`);
  }
 };
})());
// --- nhangold.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("nhangold").setDescription("Nhận vàng"),
  async execute(i) {
    const p=player(i); num(p,"coins",0); p.coins+=500; save(i,p); return reply(i,`💰 +500 Gold. Tổng: **${p.coins}**`);
  }
 };
})());
// --- nhanlinhthach.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("nhanlinhthach").setDescription("Nhận linh thạch"),
  async execute(i) {
    const p=player(i); p.currencies ||= {}; num(p.currencies,"spiritStone",0); p.currencies.spiritStone+=20; save(i,p); return reply(i,`🔷 +20 Linh Thạch.`);
  }
 };
})());
// --- nhanmerit.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("nhanmerit").setDescription("Nhận công huân"),
  async execute(i) {
    const p=player(i); p.currencies ||= {}; num(p.currencies,"merit",0); p.currencies.merit+=25; save(i,p); return reply(i,`🏅 +25 Công Huân.`);
  }
 };
})());
// --- thong_linh.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thong_linh").setDescription("Thống lĩnh"),
  async execute(i) {
    const p=player(i);p.commandLevel=(p.commandLevel||0)+1;p.honor=(p.honor||0)+20;save(i,p);return reply(i,`👑 Thống lĩnh cấp ${p.commandLevel}, +20 danh dự.`);
  }
 };
})());
// --- thuong_hoi.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thuong_hoi").setDescription("Mở thương hội"),
  async execute(i) {
    const p=player(i);p.merchantLevel=(p.merchantLevel||0)+1;save(i,p);return reply(i,`🏪 Thương hội cấp **${p.merchantLevel}**.`);
  }
 };
})());
// --- thuong_luong.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thuong_luong").setDescription("Thương lượng"),
  async execute(i) {
    const p=player(i);p.tradeReputation=(p.tradeReputation||0)+10;save(i,p);return reply(i,"🤝 Thương lượng thành công: +10 uy tín thương mại.");
  }
 };
})());
// --- thuonghoi.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("thuonghoi")
    .setDescription("Thương hội"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🏪 THƯƠNG HỘI")
      .setDescription("Xem thương hội và giao dịch.")
      .addFields(
        { name: "👤 Người chơi", value: p.username || interaction.user.username, inline: true },
        { name: "📍 Vị trí", value: p.location || "Bắc Minh", inline: true },
        { name: "⭐ Cấp", value: String(p.level || 1), inline: true }
      )
      .setFooter({ text: "Huyền Vũ Tứ Tượng • Ultimate" });
    await interaction.reply({ embeds: [embed] });
  }
 };
})());
// --- xay_linh_duoc.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("xay_linh_duoc").setDescription("Xây dược viên"),
  async execute(i) {
    const p=player(i); p.house ||= {level:1,buildings:{}}; p.house.buildings ||= {}; p.house.buildings.garden=(p.house.buildings.garden||0)+1; save(i,p); return reply(i,`🌿 Linh Dược Viên cấp **${p.house.buildings.garden}**.`);
  }
 };
})());
// --- xep_hang_ca_nhan.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("xep_hang_ca_nhan").setDescription("Xếp hạng cá nhân"),
  async execute(i) {
    const p=player(i);return reply(i,`📊 Rating PvP: **${p.pvpRating||1000}**\n⚔️ Boss: **${p.stats?.bosses||0}**\n🏆 Thành tựu: **${p.achievements?.length||0}**`);
  }
 };
})());
// --- loi_the.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("loi_the").setDescription("Lập lời thề"),
  async execute(i) {
    const p=player(i);p.oath ||= [];p.oath.push("Tứ Tượng");save(i,p);return reply(i,"⚔️ Đã lập Lời Thề Tứ Tượng.");
  }
 };
})());
// --- nghe.js ---
commands.push((function() {
const {SlashCommandBuilder,EmbedBuilder}=require("discord.js"); const {PROFESSIONS}=require("../systems");
return { data:new SlashCommandBuilder().setName("nghe").setDescription("Xem nghề nghiệp"),async execute(i){
 await i.reply({embeds:[new EmbedBuilder().setTitle("🛠️ NGHỀ NGHIỆP").setDescription(PROFESSIONS.map(x=>`• **${x.name}** — Mastery tối đa ${x.max}`).join("\n"))]});
} };
})());
// --- savegame.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("savegame").setDescription("Lưu dữ liệu"),
  async execute(i) {
    const p=player(i);save(i,p);return reply(i,"💾 Dữ liệu nhân vật đã được lưu.");
  }
 };
})());
// --- thienmenh.js ---
commands.push((function() {
const {SlashCommandBuilder,EmbedBuilder}=require("discord.js");
const db=require("../database"); const {DESTINIES}=require("../systems");
return { data:new SlashCommandBuilder().setName("thienmenh").setDescription("Xem Thiên Mệnh"),async execute(i){
 const p=db.getPlayer(i.user.id)||db.createPlayer(i.user.id,i.user.username);
 const txt=DESTINIES.map(d=>`${p.destiny===d.id?"🌟":"🔒"} **${d.name}** — ${"⭐".repeat(d.rarity)}`).join("\n");
 await i.reply({embeds:[new EmbedBuilder().setTitle("🌌 THIÊN MỆNH").setDescription(txt).addFields({name:"Hiện tại",value:p.destiny||"Chưa thức tỉnh"})]});
} };
})());
// --- xay_nha.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("xay_nha").setDescription("Xây nhà"),
  async execute(i) {
    const p=player(i); p.house ||= {level:1,buildings:{}}; p.house.level++; save(i,p); return reply(i,`🏠 Nhà lên cấp **${p.house.level}**.`);
  }
 };
})());

module.exports = commands;
