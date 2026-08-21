// Auto-grouped command bundle. Contains 18 slash commands.
const commands = [];
// Shared helper inlined to keep the upload to 19 files.
const __db = require("../database");
function player(i) { return __db.getPlayer(i.user.id) || __db.createPlayer(i.user.id, i.user.username, i.user.displayAvatarURL()); }
function save(i,p) { __db.updatePlayer(i.user.id,p); return p; }
function ensure(p,key,fallback) { if (p[key]===undefined || p[key]===null) p[key]=fallback; return p[key]; }
function num(p,key,fallback=0) { p[key]=Number(p[key] ?? fallback); if(!Number.isFinite(p[key])) p[key]=fallback; return p[key]; }
function reply(i,text) { return i.reply({content:text}); }

// --- an_buff.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("an_buff").setDescription("Ăn thức ăn"),
  async execute(i) {
    const p=player(i); p.buffs ||= {}; p.buffs.food={attack:10,expiresAt:Date.now()+1800000}; save(i,p); return reply(i,"🍲 Buff thức ăn +10 ATK trong 30 phút.");
  }
 };
})());
// --- buff.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("buff").setDescription("Kích hoạt buff"),
  async execute(i) {
    const p=player(i); p.buffs ||= {}; p.buffs.training={multiplier:1.5,expiresAt:Date.now()+3600000}; save(i,p); return reply(i,"✨ Buff luyện tập x1.5 trong 1 giờ đã kích hoạt.");
  }
 };
})());
// --- chiso.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("chiso").setDescription("Xem chỉ số"),
  async execute(i) {
    const p=player(i); return reply(i,`⚔️ ATK **${p.attack||0}** | 🛡️ DEF **${p.defense||0}** | 💨 SPD **${p.speed||0}\n🎯 Crit **${p.crit||0}%** | 🧱 Pen **${p.penetration||0}%** | ❤️ HP **${p.maxHp||0}**`);
  }
 };
})());
// --- danhhieu.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("danhhieu")
    .setDescription("Xem danh hiệu"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("👑 DANH HIỆU")
      .setDescription("Xem danh hiệu của người chơi.")
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
// --- nang_luong.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("nang_luong").setDescription("Hồi năng lượng"),
  async execute(i) {
    const p=player(i); p.energy=p.maxEnergy||120; save(i,p); return reply(i,`⚡ Năng lượng: **${p.energy}/${p.maxEnergy}**`);
  }
 };
})());
// --- rank.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Xếp hạng"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("📊 XẾP HẠNG")
      .setDescription("Xem bảng xếp hạng.")
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
// --- resetstance.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("resetstance").setDescription("Reset tư thế"),
  async execute(i) {
    const p=player(i); p.guard=false; save(i,p); return reply(i,"↩️ Đã reset tư thế.");
  }
 };
})());
// --- tang_danh_vong.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("tang_danh_vong").setDescription("Tăng danh vọng"),
  async execute(i) {
    const p=player(i); p.reputation ||= {}; p.reputation.world=(p.reputation.world||0)+50; save(i,p); return reply(i,`⭐ Danh vọng thế giới +50 = **${p.reputation.world}**.`);
  }
 };
})());
// --- tang_mastery.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("tang_mastery").setDescription("Tăng mastery"),
  async execute(i) {
    const p=player(i);p.mastery=(p.mastery||0)+25;save(i,p);return reply(i,`📈 Mastery +25 = **${p.mastery}**.`);
  }
 };
})());
// --- tangcap.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("tangcap").setDescription("Tăng cấp thử nghiệm"),
  async execute(i) {
    const p=player(i); num(p,"level",1); num(p,"exp",0); if(p.exp>=p.level*100){p.exp-=p.level*100;p.level++;p.maxHp=(p.maxHp||150)+25;p.attack=(p.attack||15)+5;p.defense=(p.defense||15)+4; p.hp=p.maxHp; save(i,p); return reply(i,`🎉 Lên cấp **${p.level}**!`);} save(i,p); return reply(i,`📈 EXP: **${p.exp}/${p.level*100}**`);
  }
 };
})());
// --- thanh_tuu_mo.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thanh_tuu_mo").setDescription("Mở thành tựu"),
  async execute(i) {
    const p=player(i); p.achievements ||= []; if(!p.achievements.includes("firstBlood"))p.achievements.push("firstBlood"); save(i,p); return reply(i,"🏆 Đã mở thành tựu **Trận Chiến Đầu Tiên**.");
  }
 };
})());
// --- xem_tien_trinh.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("xem_tien_trinh").setDescription("Tiến trình"),
  async execute(i) {
    const p=player(i);return reply(i,`📈 Cấp ${p.level||1} | EXP ${p.exp||0}\nTứ Tượng ${p.fourSymbols?.owned?.length||0}/4\nThành tựu ${p.achievements?.length||0}\nBí mật ${p.secrets?.length||0}\nBoss ${p.stats?.bosses||0}`);
  }
 };
})());
// --- xoa_buff.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("xoa_buff").setDescription("Xóa buff"),
  async execute(i) {
    const p=player(i);p.buffs={};save(i,p);return reply(i,"🧹 Đã xóa buff.");
  }
 };
})());
// --- matthu.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("matthu")
    .setDescription("Mật thư"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🗝️ MẬT THƯ")
      .setDescription("Giải mật thư và mở nội dung ẩn.")
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
// --- ngu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("ngu").setDescription("Nghỉ ngơi"),
  async execute(i) {
    const p=player(i); p.hp=p.maxHp||150;p.energy=p.maxEnergy||120;save(i,p);return reply(i,"🛏️ Nghỉ ngơi hoàn tất, HP/Năng lượng đầy.");
  }
 };
})());
// --- thamhiem.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("thamhiem")
    .setDescription("Thám hiểm"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🧭 THÁM HIỂM")
      .setDescription("Khám phá bản đồ và tìm kho báu.")
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
// --- thu_nghiem_cong_thuc.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thu_nghiem_cong_thuc").setDescription("Thử công thức"),
  async execute(i) {
    const p=player(i);p.recipeExperiments=(p.recipeExperiments||0)+1;save(i,p);return reply(i,"🧪 Bạn đã thử nghiệm một công thức mới.");
  }
 };
})());
// --- xay_tuong.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("xay_tuong").setDescription("Xây tường thành"),
  async execute(i) {
    const p=player(i);p.wallLevel=(p.wallLevel||0)+1;p.defense=(p.defense||0)+25;save(i,p);return reply(i,`🧱 Tường thành cấp ${p.wallLevel}, +25 DEF.`);
  }
 };
})());

module.exports = commands;
