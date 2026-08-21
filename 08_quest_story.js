// Auto-grouped command bundle. Contains 15 slash commands.
const commands = [];
// Shared helper inlined to keep the upload to 19 files.
const __db = require("../database");
function player(i) { return __db.getPlayer(i.user.id) || __db.createPlayer(i.user.id, i.user.username, i.user.displayAvatarURL()); }
function save(i,p) { __db.updatePlayer(i.user.id,p); return p; }
function ensure(p,key,fallback) { if (p[key]===undefined || p[key]===null) p[key]=fallback; return p[key]; }
function num(p,key,fallback=0) { p[key]=Number(p[key] ?? fallback); if(!Number.isFinite(p[key])) p[key]=fallback; return p[key]; }
function reply(i,text) { return i.reply({content:text}); }

// --- battlepass.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("battlepass").setDescription("Battle Pass"),
  async execute(i) {
    const p=player(i);p.battlePass=(p.battlePass||0)+1;p.exp=(p.exp||0)+100;save(i,p);return reply(i,`🎫 Battle Pass tiến độ **${p.battlePass}**.`);
  }
 };
})());
// --- daily.js ---
commands.push((function() {
const {SlashCommandBuilder,EmbedBuilder}=require("discord.js"); const {DAILY}=require("../systems");
return { data:new SlashCommandBuilder().setName("daily").setDescription("Nhiệm vụ hàng ngày"),async execute(i){
 await i.reply({embeds:[new EmbedBuilder().setTitle("📅 NHIỆM VỤ HÀNG NGÀY").setDescription(DAILY.map(x=>`• ${x.name}`).join("\n"))]});
} };
})());
// --- daily_quest.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("daily_quest").setDescription("Làm daily"),
  async execute(i) {
    const p=player(i);p.dailyDone ||= 0;p.dailyDone++;p.exp=(p.exp||0)+100;num(p,"coins");p.coins+=300;save(i,p);return reply(i,"📅 Daily hoàn thành: +100 EXP, +300 Gold.");
  }
 };
})());
// --- dailyclaim.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("dailyclaim").setDescription("Nhận quà ngày"),
  async execute(i) {
    const p=player(i); p.dailyClaim=Date.now(); num(p,"coins",0); p.coins+=1000; save(i,p); return reply(i,`🎁 Bạn nhận **1000 Gold** quà ngày.`);
  }
 };
})());
// --- gacha_history.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("gacha_history").setDescription("Lịch sử gacha"),
  async execute(i) {
    const p=player(i); return reply(i,`🎴 Tổng lượt triệu hồi: **${p.gacha?.pulls||0}**\n🔥 Pity hiện tại: **${p.gacha?.pity||0}**`);
  }
 };
})());
// --- nhan_nhiem_vu_an.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('nhan_nhiem_vu_an').setDescription('Nhận nhiệm vụ ẩn'),async execute(i){const p=player(i); p.quests=p.quests||[]; p.quests.push({id:'hidden_'+Date.now(),type:'hidden',progress:0,acceptedAt:Date.now()}); save(i,p); return reply(i,'✅ Nhận nhiệm vụ ẩn — tiến trình đã được lưu.');} };
})());
// --- nhiemvu.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("nhiemvu")
    .setDescription("Xem nhiệm vụ"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("📜 NHIỆM VỤ")
      .setDescription("Xem nhiệm vụ chính, phụ, ẩn và thế giới.")
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
// --- season_claim.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("season_claim").setDescription("Nhận thưởng mùa"),
  async execute(i) {
    const p=player(i);p.season ||= {points:0,tier:1,claimed:[]};if((p.season.claimed||[]).includes(p.season.tier))return reply(i,"❌ Đã nhận tier này.");p.season.claimed.push(p.season.tier);num(p,"gems");p.gems+=10;save(i,p);return reply(i,`🎖️ Nhận thưởng Season Tier ${p.season.tier}.`);
  }
 };
})());
// --- season_point.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("season_point").setDescription("Nhận điểm mùa"),
  async execute(i) {
    const p=player(i); p.season ||= {points:0,tier:1,claimed:[]}; p.season.points+=100;p.season.tier=Math.floor(p.season.points/100)+1;save(i,p);return reply(i,`🏅 Điểm mùa +100. Tier **${p.season.tier}**.`);
  }
 };
})());
// --- weekly_quest.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("weekly_quest").setDescription("Làm weekly"),
  async execute(i) {
    const p=player(i);p.weeklyDone=(p.weeklyDone||0)+1;p.exp=(p.exp||0)+500;num(p,"coins");p.coins+=2000;save(i,p);return reply(i,"🗓️ Weekly hoàn thành: +500 EXP, +2000 Gold.");
  }
 };
})());
// --- khoxe.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("khoxe")
    .setDescription("Xem kho"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("📦 KHO")
      .setDescription("Xem vật phẩm trong kho.")
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
// --- nang_kho.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("nang_kho").setDescription("Nâng kho"),
  async execute(i) {
    const p=player(i);p.inventoryCapacity=(p.inventoryCapacity||50)+10;save(i,p);return reply(i,`📦 Sức chứa kho: **${p.inventoryCapacity}**.`);
  }
 };
})());
// --- resetbattle.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("resetbattle").setDescription("Reset chiến đấu"),
  async execute(i) {
    const p=player(i); p.hp=p.maxHp||150; p.energy=p.maxEnergy||120; p.statuses=[]; save(i,p); return reply(i,"🔄 Trạng thái chiến đấu đã được reset.");
  }
 };
})());
// --- thay_doi_menh.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thay_doi_menh").setDescription("Thay đổi vận mệnh"),
  async execute(i) {
    const p=player(i);p.destinyReroll=(p.destinyReroll||0)+1;p.luck=(p.luck||0)+5;save(i,p);return reply(i,"🌌 Vận mệnh đã được làm mới, Luck +5.");
  }
 };
})());
// --- tuong_hop_kich.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('tuong_hop_kich').setDescription('Kích hoạt Tứ Tượng Hợp Kích'),async execute(i){const p=player(i); p.fourSymbols=p.fourSymbols||{}; p.fourSymbols.resonance=Math.min(100,(p.fourSymbols.resonance||0)+25); p.attack=(p.attack||0)+200; p.defense=(p.defense||0)+150; save(i,p); return reply(i,'✅ Kích hoạt Tứ Tượng Hợp Kích — tiến trình đã được lưu.');} };
})());

module.exports = commands;
