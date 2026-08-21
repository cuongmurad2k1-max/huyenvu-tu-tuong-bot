// Auto-grouped command bundle. Contains 6 slash commands.
const commands = [];
// Shared helper inlined to keep the upload to 19 files.
const __db = require("../database");
function player(i) { return __db.getPlayer(i.user.id) || __db.createPlayer(i.user.id, i.user.username, i.user.displayAvatarURL()); }
function save(i,p) { __db.updatePlayer(i.user.id,p); return p; }
function ensure(p,key,fallback) { if (p[key]===undefined || p[key]===null) p[key]=fallback; return p[key]; }
function num(p,key,fallback=0) { p[key]=Number(p[key] ?? fallback); if(!Number.isFinite(p[key])) p[key]=fallback; return p[key]; }
function reply(i,text) { return i.reply({content:text}); }

// --- khoangsan.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("khoangsan")
    .setDescription("Khai khoáng"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("⛏️ KHAI KHOÁNG")
      .setDescription("Khai thác tài nguyên.")
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
// --- mo_thien_phu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mo_thien_phu").setDescription("Mở thiên phú"),
  async execute(i) {
    const p=player(i); p.talents ||= []; if(!p.talents.includes("chienDau"))p.talents.push("chienDau"); save(i,p); return reply(i,"✨ Đã mở thiên phú **Chiến Đấu Thiên Tài**.");
  }
 };
})());
// --- quan_sat.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("quan_sat").setDescription("Quan sát Boss"),
  async execute(i) {
    const p=player(i);p.bossIntel=(p.bossIntel||0)+10;save(i,p);return reply(i,"👁️ Phân tích Boss +10 Intel.");
  }
 };
})());
// --- thanhtuu.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("thanhtuu")
    .setDescription("Xem thành tựu"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🏆 THÀNH TỰU")
      .setDescription("Xem thành tựu đã mở khóa.")
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
// --- trung_thanh.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("trung_thanh").setDescription("Huấn luyện đồng hành"),
  async execute(i) {
    const p=player(i); p.companionBond=(p.companionBond||0)+10; save(i,p); return reply(i,`🤝 Quan hệ đồng hành +10 = **${p.companionBond}**.`);
  }
 };
})());
// --- trangsuc.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("trangsuc")
    .setDescription("Xem trang sức"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("💍 TRANG SỨC")
      .setDescription("Xem phụ kiện và trang sức.")
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

module.exports = commands;
