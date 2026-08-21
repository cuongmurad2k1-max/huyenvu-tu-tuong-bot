// Auto-grouped command bundle. Contains 15 slash commands.
const commands = [];
// Shared helper inlined to keep the upload to 19 files.
const __db = require("../database");
function player(i) { return __db.getPlayer(i.user.id) || __db.createPlayer(i.user.id, i.user.username, i.user.displayAvatarURL()); }
function save(i,p) { __db.updatePlayer(i.user.id,p); return p; }
function ensure(p,key,fallback) { if (p[key]===undefined || p[key]===null) p[key]=fallback; return p[key]; }
function num(p,key,fallback=0) { p[key]=Number(p[key] ?? fallback); if(!Number.isFinite(p[key])) p[key]=fallback; return p[key]; }
function reply(i,text) { return i.reply({content:text}); }

// --- bang_diem.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("bang_diem").setDescription("Điểm bang"),
  async execute(i) {
    const p=player(i); if(!p.guild)return reply(i,"❌ Chưa có bang."); p.guild.warScore=(p.guild.warScore||0)+50; save(i,p); return reply(i,`🏯 +50 điểm bang = **${p.guild.warScore}**.`);
  }
 };
})());
// --- bang_kho.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("bang_kho").setDescription("Bang hội kho"),
  async execute(i) {
    const p=player(i); if(!p.guild)return reply(i,"❌ Chưa có bang."); p.guild.bank=(p.guild.bank||0)+1000; save(i,p); return reply(i,"📦 Kho bang +1000 Gold.");
  }
 };
})());
// --- bang_quest.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("bang_quest").setDescription("Nhiệm vụ bang"),
  async execute(i) {
    const p=player(i); if(!p.guild)return reply(i,"❌ Chưa có bang."); p.guild.questCount=(p.guild.questCount||0)+1;p.guild.warScore=(p.guild.warScore||0)+30;save(i,p);return reply(i,"📜 Hoàn thành 1 nhiệm vụ bang: +30 điểm.");
  }
 };
})());
// --- banghoi.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("banghoi")
    .setDescription("Bang hội"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🏯 BANG HỘI")
      .setDescription("Xem thông tin bang hội.")
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
// --- chiem_lanh_tho.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("chiem_lanh_tho").setDescription("Chiếm lãnh thổ"),
  async execute(i) {
    const p=player(i); if(!p.guild)return reply(i,"❌ Chưa có bang."); p.guild.territories ||= []; const t=["Thanh Long Thành","Bạch Hổ Thành","Chu Tước Thành","Huyền Vũ Thành"][p.guild.territories.length%4]; if(!p.guild.territories.includes(t))p.guild.territories.push(t); p.guild.warScore=(p.guild.warScore||0)+100; save(i,p); return reply(i,`🏰 Bang chiếm **${t}**. +100 điểm chiến tranh.`);
  }
 };
})());
// --- diem_danh_bang.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("diem_danh_bang").setDescription("Điểm danh bang"),
  async execute(i) {
    const p=player(i);if(!p.guild)return reply(i,"❌ Chưa có bang.");p.guild.attendance=(p.guild.attendance||0)+1;p.guild.warScore=(p.guild.warScore||0)+10;save(i,p);return reply(i,"🏯 Điểm danh bang +10 điểm.");
  }
 };
})());
// --- nang_guild.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("nang_guild").setDescription("Nâng bang hội"),
  async execute(i) {
    const p=player(i); if(!p.guild)return reply(i,"❌ Chưa có bang."); p.guild.level=(p.guild.level||1)+1; save(i,p); return reply(i,`🏯 Bang lên cấp **${p.guild.level}**.`);
  }
 };
})());
// --- phobang.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("phobang")
    .setDescription("Phó bản"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("⚔️ PHÓ BẢN")
      .setDescription("Xem các phó bản.")
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
// --- tao_guild.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("tao_guild").setDescription("Tạo bang hội"),
  async execute(i) {
    const p=player(i); if(p.guild)return reply(i,"❌ Bạn đã có bang."); p.guild={name:`Bang ${i.user.username}`,owner:i.user.id,level:1,members:[i.user.id],warScore:0}; save(i,p); return reply(i,`🏯 Đã tạo **${p.guild.name}**.`);
  }
 };
})());
// --- khoi_dong_di_tich.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("khoi_dong_di_tich").setDescription("Khởi động di tích"),
  async execute(i) {
    const p=player(i);p.relicSite=(p.relicSite||0)+1;p.exp=(p.exp||0)+300;save(i,p);return reply(i,"🏛️ Di tích khởi động: +300 EXP.");
  }
 };
})());
// --- mucluc.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("mucluc")
    .setDescription("Mục lục hệ thống"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🧩 MỤC LỤC HỆ THỐNG")
      .setDescription("Xem toàn bộ hệ thống của bot.")
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
// --- quanhe.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("quanhe")
    .setDescription("Quan hệ NPC"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("❤️ QUAN HỆ NPC")
      .setDescription("Xem quan hệ với NPC.")
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
// --- thap_chinh.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thap_chinh").setDescription("Tháp thử thách"),
  async execute(i) {
    const p=player(i); p.towerFloor=(p.towerFloor||0)+1; p.exp=(p.exp||0)+100+p.towerFloor*20; save(i,p); return reply(i,`🗼 Vượt tầng **${p.towerFloor}**, nhận EXP.`);
  }
 };
})());
// --- truytim.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("truytim")
    .setDescription("Truy tìm"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🔎 TRUY TÌM")
      .setDescription("Tìm manh mối và bí mật.")
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
// --- tui.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("tui")
    .setDescription("Xem túi đồ"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🎒 TÚI ĐỒ")
      .setDescription("Xem vật phẩm đang sở hữu.")
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
