// Auto-grouped command bundle. Contains 17 prefix commands.
const commands = [];
// Shared helper inlined to keep the upload to 19 files.
const __db = require("../database");
function player(i) { return __db.getPlayer(i.user.id) || __db.createPlayer(i.user.id, i.user.username, i.user.displayAvatarURL()); }
function save(i,p) { __db.updatePlayer(i.user.id,p); return p; }
function ensure(p,key,fallback) { if (p[key]===undefined || p[key]===null) p[key]=fallback; return p[key]; }
function num(p,key,fallback=0) { p[key]=Number(p[key] ?? fallback); if(!Number.isFinite(p[key])) p[key]=fallback; return p[key]; }
function reply(i,text) { return i.reply({content:text}); }

// --- boss.js ---
commands.push((function() {
const {SlashCommandBuilder,EmbedBuilder}=require("discord.js");
const {BOSSES}=require("../systems"); const {WORLD_BOSSES}=require("../systems");
return { data:new SlashCommandBuilder().setName("boss").setDescription("Xem Boss"),async execute(i){
 const text=[...BOSSES.map(b=>`👑 **${b.name}** — HP ${b.hp.toLocaleString()} — ${b.phases} phase`),...WORLD_BOSSES.map(b=>`🌍 **${b.name}** — HP ${b.hp.toLocaleString()} — ${b.phase} phase`)].join("\n");
 await i.reply({embeds:[new EmbedBuilder().setTitle("👑 HỆ THỐNG BOSS").setDescription(text)]});
} };
})());
// --- boss_phase.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("boss_phase").setDescription("Đổi phase Boss"),
  async execute(i) {
    const p=player(i); p.bossPhase=(p.bossPhase||0)+1; save(i,p); return reply(i,`🔥 Boss chuyển sang Phase **${p.bossPhase}**.`);
  }
 };
})());
// --- danh_boss.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("danh_boss").setDescription("Đánh Boss"),
  async execute(i) {
    const p=player(i); p.stats ||= {}; p.stats.bosses=(p.stats.bosses||0)+1; p.exp=(p.exp||0)+500; num(p,"coins"); p.coins+=1500; save(i,p); return reply(i,"👑 Boss bị đánh bại trong mô phỏng: +500 EXP, +1500 Gold.");
  }
 };
})());
// --- mo_boss.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mo_boss").setDescription("Ghi nhận Boss"),
  async execute(i) {
    const p=player(i); p.codex ||= {}; p.codex.bosses ||= []; if(!p.codex.bosses.includes("boss001"))p.codex.bosses.push("boss001"); save(i,p); return reply(i,"👑 Đã ghi nhận Boss Thượng Cổ 001.");
  }
 };
})());
// --- phat_hien_boss.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("phat_hien_boss").setDescription("Phát hiện Boss"),
  async execute(i) {
    const p=player(i);p.bossesFound=(p.bossesFound||0)+1;save(i,p);return reply(i,"👁️ Phát hiện một dấu vết Boss.");
  }
 };
})());
// --- raid.js ---
commands.push((function() {
const {SlashCommandBuilder,EmbedBuilder}=require("discord.js"); const {RAID_TIERS}=require("../systems");
return { data:new SlashCommandBuilder().setName("raid").setDescription("Xem Raid"),async execute(i){
 await i.reply({embeds:[new EmbedBuilder().setTitle("⚔️ RAID").setDescription(RAID_TIERS.map(x=>`🔥 ${x.name} — ${x.party} người — Boss HP ${x.hp.toLocaleString()}`).join("\n"))]});
} };
})());
// --- raid_join.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("raid_join").setDescription("Tham gia Raid"),
  async execute(i) {
    const p=player(i); p.raid={joined:true,joinedAt:Date.now()}; save(i,p); return reply(i,"⚔️ Bạn đã tham gia hàng chờ Raid.");
  }
 };
})());
// --- raid_leave.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("raid_leave").setDescription("Rời Raid"),
  async execute(i) {
    const p=player(i); p.raid=null; save(i,p); return reply(i,"🚪 Bạn đã rời Raid.");
  }
 };
})());
// --- raid_than_dien.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('raid_than_dien').setDescription('Tham gia Raid Thần Điện'),async execute(i){const p=player(i); p.stats=p.stats||{}; p.stats.raid=(p.stats.raid||0)+1; p.exp=(p.exp||0)+800; save(i,p); return reply(i,'✅ Tham gia Raid Thần Điện — tiến trình đã được lưu.');} };
})());
// --- raidboss.js ---
commands.push((function() {
const {SlashCommandBuilder,EmbedBuilder}=require("discord.js"); const {WORLD_BOSSES}=require("../systems");
return { data:new SlashCommandBuilder().setName("bossworld").setDescription("Boss toàn server"),async execute(i){
 await i.reply({embeds:[new EmbedBuilder().setTitle("🌍 WORLD BOSS").setDescription(WORLD_BOSSES.map(x=>`👑 **${x.name}**\n❤️ ${x.hp.toLocaleString()} HP\n⚔️ ${x.attack.toLocaleString()} ATK\n`).join("\n"))]});
} };
})());
// --- san_boss_the_gioi.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('san_boss_the_gioi').setDescription('Săn boss thế giới'),async execute(i){const p=player(i); p.stats=p.stats||{}; p.stats.bosses=(p.stats.bosses||0)+1; p.exp=(p.exp||0)+700; p.currencies=p.currencies||{}; p.currencies.merit=(p.currencies.merit||0)+25; save(i,p); return reply(i,'✅ Săn boss thế giới — tiến trình đã được lưu.');} };
})());
// --- khai_khoang.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("khai_khoang").setDescription("Khai khoáng"),
  async execute(i) {
    const p=player(i); p.mining=(p.mining||0)+1; p.inventory ||= []; p.inventory.push("ore_"+p.mining); save(i,p); return reply(i,`⛏️ Khai khoáng thành công. Thu được quặng #${p.mining}.`);
  }
 };
})());
// --- mo_slot.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mo_slot").setDescription("Mở ô trang bị"),
  async execute(i) {
    const p=player(i); p.equipmentSlots=(p.equipmentSlots||2)+1; save(i,p); return reply(i,`🔓 Đã mở thêm 1 slot. Tổng: **${p.equipmentSlots}**`);
  }
 };
})());
// --- phuvăn.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("phuvan")
    .setDescription("Phù văn"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("📜 PHÙ VĂN")
      .setDescription("Xem hệ thống phù văn.")
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
// --- thanhdia.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("thanhdia")
    .setDescription("Thánh địa"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🏛️ THÁNH ĐỊA")
      .setDescription("Xem các Thánh Địa Tứ Tượng.")
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
// --- trieuhon.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("trieuhon")
    .setDescription("Triệu hồi"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🎴 TRIỆU HỒI")
      .setDescription("Xem banner triệu hồi.")
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
// --- trangbi.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("trangbi")
    .setDescription("Xem trang bị"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🛡️ TRANG BỊ")
      .setDescription("Xem vũ khí, giáp, phụ kiện và di vật đang trang bị.")
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
