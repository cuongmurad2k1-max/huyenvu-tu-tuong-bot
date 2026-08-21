// Auto-grouped command bundle. Contains 14 prefix commands.
const commands = [];
// Shared helper inlined to keep the upload to 19 files.
const __db = require("../database");
function player(i) { return __db.getPlayer(i.user.id) || __db.createPlayer(i.user.id, i.user.username, i.user.displayAvatarURL()); }
function save(i,p) { __db.updatePlayer(i.user.id,p); return p; }
function ensure(p,key,fallback) { if (p[key]===undefined || p[key]===null) p[key]=fallback; return p[key]; }
function num(p,key,fallback=0) { p[key]=Number(p[key] ?? fallback); if(!Number.isFinite(p[key])) p[key]=fallback; return p[key]; }
function reply(i,text) { return i.reply({content:text}); }

// --- mangxahoi.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("danhvong")
    .setDescription("Danh vọng"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("⭐ DANH VỌNG")
      .setDescription("Xem danh vọng và quan hệ NPC.")
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
// --- roi_party.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("roi_party").setDescription("Rời party"),
  async execute(i) {
    const p=player(i); p.party=null; save(i,p); return reply(i,"🚪 Đã rời party.");
  }
 };
})());
// --- tao_party.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("tao_party").setDescription("Tạo party"),
  async execute(i) {
    const p=player(i); p.party={owner:i.user.id,members:[i.user.id],max:5}; save(i,p); return reply(i,"👥 Đã tạo party 5 người.");
  }
 };
})());
// --- thiendestiny.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thiendestiny").setDescription("Tiến hóa Thiên Mệnh"),
  async execute(i) {
    const p=player(i); p.destinyProgress=(p.destinyProgress||0)+10; if(p.destinyProgress>=100){p.destinyTier=(p.destinyTier||0)+1;p.destinyProgress=0;} save(i,p); return reply(i,`🌌 Thiên Mệnh tiến độ **${p.destinyProgress}/100**, tầng ${p.destinyTier||0}.`);
  }
 };
})());
// --- thongtin.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thongtin").setDescription("Xem hồ sơ"),
  async execute(i) {
    const p=player(i); return reply(i,`👤 **${p.username||i.user.username}**\n⭐ Cấp: ${p.level||1}\n❤️ HP: ${p.hp||0}/${p.maxHp||0}\n⚔️ ATK: ${p.attack||0}\n🛡️ DEF: ${p.defense||0}\n💰 Gold: ${p.coins||0}`);
  }
 };
})());
// --- thucTinh.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("thuctinh")
    .setDescription("Thức tỉnh"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🌟 THỨC TỈNH")
      .setDescription("Xem các cấp thức tỉnh.")
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
// --- thuc_tinh_than_khi.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('thuc_tinh_than_khi').setDescription('Thức tỉnh thần khí'),async execute(i){const p=player(i); p.equipment=p.equipment||{}; p.equipment.relic=p.equipment.relic||{name:'Thần Khí Tứ Tượng',level:0}; p.equipment.relic.awakened=true; p.attack=(p.attack||0)+150; p.defense=(p.defense||0)+100; save(i,p); return reply(i,'✅ Thức tỉnh thần khí — tiến trình đã được lưu.');} };
})());
// --- truyen_day.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("truyen_day").setDescription("Truyền dạy"),
  async execute(i) {
    const p=player(i);p.teach=(p.teach||0)+1;p.reputation ||= {};p.reputation.world=(p.reputation.world||0)+15;save(i,p);return reply(i,"📚 Truyền dạy thành công: +15 danh vọng.");
  }
 };
})());
// --- truyen_tin.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("truyen_tin").setDescription("Truyền tin"),
  async execute(i) {
    const p=player(i);p.messagesSent=(p.messagesSent||0)+1;save(i,p);return reply(i,"📨 Đã ghi nhận một lần truyền tin.");
  }
 };
})());
// --- luu_vi_tri.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("luu_vi_tri").setDescription("Lưu vị trí"),
  async execute(i) {
    const p=player(i); p.savedLocation=p.location||"Bắc Minh"; save(i,p); return reply(i,`📍 Đã lưu vị trí **${p.savedLocation}**.`);
  }
 };
})());
// --- nghien_cuu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("nghien_cuu").setDescription("Nghiên cứu"),
  async execute(i) {
    const p=player(i);p.research=(p.research||0)+25;save(i,p);return reply(i,`🔬 Nghiên cứu +25 = ${p.research}.`);
  }
 };
})());
// --- thach_dau.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thach_dau").setDescription("Thách đấu"),
  async execute(i) {
    const p=player(i);p.duels=(p.duels||0)+1;p.stats ||= {};p.stats.wins=(p.stats.wins||0)+1;save(i,p);return reply(i,"🥊 Thách đấu thắng: ghi nhận 1 chiến thắng.");
  }
 };
})());
// --- thienphu.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("thienphu")
    .setDescription("Xem thiên phú"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("✨ THIÊN PHÚ")
      .setDescription("Xem thiên phú nhân vật.")
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
// --- xay_thu_vien.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("xay_thu_vien").setDescription("Xây thư viện"),
  async execute(i) {
    const p=player(i); p.house ||= {level:1,buildings:{}}; p.house.buildings ||= {}; p.house.buildings.library=(p.house.buildings.library||0)+1; save(i,p); return reply(i,`📚 Thư viện cấp **${p.house.buildings.library}**.`);
  }
 };
})());

module.exports = commands;
